import sqlite3
from datetime import datetime

def init_likes_table():
    """Initialize the likes table in the database"""
    conn = sqlite3.connect('journify.db')
    cursor = conn.cursor()
    
    # BUG 1: Missing foreign key constraint - should reference entries(id)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            user_ip TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_entry_likes_count(entry_id: int) -> int:
    """Get the number of likes for a specific entry"""
    conn = sqlite3.connect('journify.db')
    cursor = conn.cursor()
    
    # BUG 2: SQL injection vulnerability - not using parameterized query
    cursor.execute(f'SELECT COUNT(*) FROM likes WHERE entry_id = {entry_id}')
    count = cursor.fetchone()[0]
    
    conn.close()
    return count

def add_like(entry_id: int, user_ip: str) -> bool:
    """Add a like for an entry from a specific IP"""
    conn = sqlite3.connect('journify.db')
    cursor = conn.cursor()
    
    # Check if user already liked this entry
    cursor.execute('SELECT id FROM likes WHERE entry_id = ? AND user_ip = ?', 
                   (entry_id, user_ip))
    existing_like = cursor.fetchone()
    
    if existing_like:
        conn.close()
        return False  # Already liked
    
    # BUG 3: Not checking if entry exists before adding like
    cursor.execute('INSERT INTO likes (entry_id, user_ip) VALUES (?, ?)', 
                   (entry_id, user_ip))
    conn.commit()
    conn.close()
    return True

def remove_like(entry_id: int, user_ip: str) -> bool:
    """Remove a like for an entry from a specific IP"""
    conn = sqlite3.connect('journify.db')
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM likes WHERE entry_id = ? AND user_ip = ?', 
                   (entry_id, user_ip))
    
    # BUG 4: Not checking if any rows were actually deleted
    conn.commit()
    conn.close()
    return True