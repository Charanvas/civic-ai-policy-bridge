import sqlite3
import json
from datetime import datetime
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Policies table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS policies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            original_text TEXT NOT NULL,
            simplified_text TEXT,
            demographic_impacts TEXT,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reading_level TEXT DEFAULT 'high_school'
        )
    ''')
    
    # Feedback table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            policy_id INTEGER NOT NULL,
            feedback_type TEXT NOT NULL,
            feedback_text TEXT NOT NULL,
            sentiment TEXT,
            key_points TEXT,
            category TEXT,
            submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (policy_id) REFERENCES policies (id)
        )
    ''')
    
    conn.commit()
    conn.close()

class Policy:
    @staticmethod
    def create(title, original_text, simplified_text, demographic_impacts, reading_level='high_school'):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO policies (title, original_text, simplified_text, demographic_impacts, reading_level)
            VALUES (?, ?, ?, ?, ?)
        ''', (title, original_text, simplified_text, json.dumps(demographic_impacts), reading_level))
        policy_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return policy_id
    
    @staticmethod
    def get_by_id(policy_id):
        conn = get_db_connection()
        policy = conn.execute('SELECT * FROM policies WHERE id = ?', (policy_id,)).fetchone()
        conn.close()
        return dict(policy) if policy else None
    
    @staticmethod
    def get_all():
        conn = get_db_connection()
        policies = conn.execute('SELECT * FROM policies ORDER BY upload_date DESC').fetchall()
        conn.close()
        return [dict(policy) for policy in policies]

class Feedback:
    @staticmethod
    def create(policy_id, feedback_type, feedback_text, sentiment, key_points, category):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO feedback (policy_id, feedback_type, feedback_text, sentiment, key_points, category)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (policy_id, feedback_type, feedback_text, sentiment, json.dumps(key_points), category))
        feedback_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return feedback_id
    
    @staticmethod
    def get_by_policy(policy_id):
        conn = get_db_connection()
        feedbacks = conn.execute('SELECT * FROM feedback WHERE policy_id = ? ORDER BY submission_date DESC', (policy_id,)).fetchall()
        conn.close()
        return [dict(feedback) for feedback in feedbacks]