from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import sqlite3
import csv
import os
import json
from datetime import datetime

app = Flask(__name__, static_folder='dist')
app.secret_key = 'clinical-secret-key'
# Enable CORS with credentials support for session persistence
CORS(app, supports_credentials=True, origins=['http://localhost:5000', 'http://localhost', 'localhost:5000'])

# Configuration
DB_PATH = ':memory:'
USERS_CSV = 'users.csv'
EVALUATIONS_CSV = 'evaluations.csv'
QUESTIONS_JSON = 'questions.json'

# Initialize In-memory DB
# We use a global connection for simplicity in this single-threaded dev environment
db = sqlite3.connect(DB_PATH, check_same_thread=False)
db.row_factory = sqlite3.Row
cursor = db.cursor()

def init_db():
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            category_id TEXT,
            question_id TEXT,
            response TEXT,
            score INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    db.commit()

def sync_to_csv():
    # Sync Users
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    with open(USERS_CSV, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'username', 'password'])
        for user in users:
            writer.writerow([user['id'], user['username'], user['password']])
    
    # Sync Evaluations
    cursor.execute("SELECT * FROM evaluations")
    evals = cursor.fetchall()
    with open(EVALUATIONS_CSV, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'user_id', 'category_id', 'question_id', 'response', 'score', 'timestamp'])
        for ev in evals:
            writer.writerow([ev['id'], ev['user_id'], ev['category_id'], ev['question_id'], ev['response'], ev['score'], ev['timestamp']])

# Initialize and Seed
init_db()
cursor.execute("SELECT count(*) as count FROM users")
if cursor.fetchone()['count'] == 0:
    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", ('admin', 'admin123'))
    db.commit()
    sync_to_csv()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password))
    user = cursor.fetchone()
    if user:
        session['user_id'] = user['id']
        session['username'] = user['username']
        return jsonify({'success': True, 'user': {'id': user['id'], 'username': user['username']}})
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/me', methods=['GET'])
def me():
    if 'user_id' in session:
        return jsonify({'authenticated': True, 'user': {'id': session['user_id'], 'username': session['username']}})
    return jsonify({'authenticated': False})

@app.route('/api/questions', methods=['GET'])
def get_questions():
    if not os.path.exists(QUESTIONS_JSON):
        return jsonify({'error': 'Questions file not found'}), 404
    with open(QUESTIONS_JSON, 'r') as f:
        return jsonify(json.load(f))

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    if 'user_id' not in session:
        # Debug: log session contents
        app.logger.info(f'Session contents: {dict(session)}')
        return jsonify({'message': 'Unauthorized'}), 401
    
    data = request.json
    responses = data.get('responses', [])
    user_id = session['user_id']
    
    for item in responses:
        cursor.execute(
            "INSERT INTO evaluations (user_id, category_id, question_id, response, score) VALUES (?, ?, ?, ?, ?)",
            (user_id, item['categoryId'], item['questionId'], item['response'], item['score'])
        )
    db.commit()
    sync_to_csv()
    return jsonify({'success': True})

@app.route('/api/scores', methods=['GET'])
def get_scores():
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    cursor.execute('''
        SELECT category_id, AVG(score) as average_score, SUM(score) as total_score, COUNT(*) as count
        FROM evaluations
        WHERE user_id = ?
        GROUP BY category_id
    ''', (user_id,))
    rows = cursor.fetchall()
    return jsonify([dict(row) for row in rows])

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # In production, use a real WSGI server like Gunicorn
    app.run(host='0.0.0.0', port=3000, debug=True)
