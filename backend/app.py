from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import datetime
from typing import List, Dict
from models import init_likes_table, get_entry_likes_count, add_like, remove_like

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('journify.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            location TEXT,
            date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
            tags TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    
    # Initialize likes table
    init_likes_table()

@app.route('/api/entries', methods=['GET'])
def get_entries():
    conn = sqlite3.connect('journify.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM entries ORDER BY date_created DESC')
    entries = cursor.fetchall()
    conn.close()
    
    # Add likes count to each entry
    entries_with_likes = []
    for entry in entries:
        entry_dict = {
            'id': entry[0],
            'title': entry[1],
            'content': entry[2],
            'location': entry[3],
            'date_created': entry[4],
            'tags': entry[5].split(',') if entry[5] else [],
            'likes_count': get_entry_likes_count(entry[0])
        }
        entries_with_likes.append(entry_dict)
    
    return jsonify(entries_with_likes)

@app.route('/api/entries', methods=['POST'])
def create_entry():
    data = request.get_json()
    
    conn = sqlite3.connect('journify.db')
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO entries (title, content, location, tags) VALUES (?, ?, ?, ?)',
        (data['title'], data['content'], data.get('location'), ','.join(data.get('tags', [])))
    )
    conn.commit()
    entry_id = cursor.lastrowid
    conn.close()
    
    return jsonify({'id': entry_id, 'message': 'Entry created successfully'}), 201

@app.route('/api/entries/<int:entry_id>/like', methods=['POST'])
def like_entry(entry_id):
    """Like an entry"""
    user_ip = request.remote_addr
    
    # BUG 5: Not handling the case where add_like returns False (already liked)
    add_like(entry_id, user_ip)
    likes_count = get_entry_likes_count(entry_id)
    
    return jsonify({
        'message': 'Entry liked successfully',
        'likes_count': likes_count
    }), 200

@app.route('/api/entries/<int:entry_id>/unlike', methods=['POST'])
def unlike_entry(entry_id):
    """Unlike an entry"""
    user_ip = request.remote_addr
    
    # BUG 6: Using DELETE instead of POST method in route (should be DELETE method)
    remove_like(entry_id, user_ip)
    likes_count = get_entry_likes_count(entry_id)
    
    return jsonify({
        'message': 'Entry unliked successfully',
        'likes_count': likes_count
    }), 200

# BUG 7: Missing endpoint to check if user has liked an entry
# This is needed for the frontend to show correct like state

if __name__ == '__main__':
    init_db()
    app.run(debug=True)