from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import PyPDF2
import io
import re
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///students.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    grade = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    goals = db.relationship('LearningGoal', backref='student', lazy=True)

class LearningGoal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    goal_text = db.Column(db.Text, nullable=False)
    baseline = db.Column(db.Text, nullable=True)

def extract_iep_goals(pdf_content):
    """Extract learning goals and baselines from IEP PDF"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        goal_pattern = r'Goal \d+:?\s*([^.]+\.)'
        baseline_pattern = r'Baseline:?\s*([^.]+\.)'
        
        goals = re.findall(goal_pattern, text, re.IGNORECASE)
        baselines = re.findall(baseline_pattern, text, re.IGNORECASE)
        
        extracted_goals = []
        for i, goal in enumerate(goals):
            baseline = baselines[i] if i < len(baselines) else "No baseline found"
            extracted_goals.append({
                'goal': goal.strip(),
                'baseline': baseline.strip()
            })
        
        return extracted_goals
    except Exception as e:
        return []

@app.route('/api/students', methods=['POST'])
def add_student():
    try:
        name = request.form.get('name')
        grade = request.form.get('grade')
        
        student = Student(name=name, grade=grade)
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'student_id': student.id,
            'message': 'Student added successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/extract-goals', methods=['POST'])
def extract_goals():
    try:
        if 'iep_file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['iep_file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        pdf_content = file.read()
        goals = extract_iep_goals(pdf_content)
        
        return jsonify({
            'success': True,
            'goals': goals
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/students/<int:student_id>/goals', methods=['POST'])
def add_student_goals(student_id):
    try:
        data = request.get_json()
        selected_goals = data.get('goals', [])
        
        for goal_data in selected_goals:
            goal = LearningGoal(
                student_id=student_id,
                goal_text=goal_data['goal'],
                baseline=goal_data['baseline'],
                selected=True
            )
            db.session.add(goal)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Added {len(selected_goals)} goals for student'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    student = Student.query.get_or_404(student_id)
    return jsonify({
        'id': student.id,
        'name': student.name,
        'grade': student.grade,
        'goals': [{
            'id': goal.id,
            'goal_text': goal.goal_text,
            'baseline': goal.baseline
        } for goal in student.goals]
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)