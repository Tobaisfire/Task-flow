from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import re
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

TASKS_FILE = 'tasks.json'

def load_tasks():
    if os.path.exists(TASKS_FILE):
        try:
            with open(TASKS_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_tasks(tasks):
    with open(TASKS_FILE, 'w') as f:
        json.dump(tasks, f, indent=2)

def analyze_priority(title):
    title_lower = title.lower()
    
    urgent_keywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'now']
    high_keywords = ['important', 'priority', 'today', 'deadline', 'due', 'must']
    medium_keywords = ['soon', 'this week', 'review', 'update', 'check']
    
    for keyword in urgent_keywords:
        if keyword in title_lower:
            return {'level': 'urgent', 'score': 4, 'reason': f'Contains "{keyword}"'}
    
    for keyword in high_keywords:
        if keyword in title_lower:
            return {'level': 'high', 'score': 3, 'reason': f'Contains "{keyword}"'}
    
    for keyword in medium_keywords:
        if keyword in title_lower:
            return {'level': 'medium', 'score': 2, 'reason': f'Contains "{keyword}"'}
    
    return {'level': 'normal', 'score': 1, 'reason': 'No priority indicators detected'}

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = load_tasks()
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    title = data.get('title', '').strip()
    print(data)
    
    if not title:
        return jsonify({'error': 'Task title is required'}), 400
    
    priority = analyze_priority(title)
    
    task = {
        'id': str(uuid.uuid4()),
        'title': title,
        'completed': False,
        'priority': priority,
        'created_at': datetime.now().isoformat()    
    }
    
    tasks = load_tasks()
    tasks.append(task)
    save_tasks(tasks)
    
    return jsonify(task), 201

@app.route('/api/tasks/<task_id>', methods=['PATCH'])
def update_task(task_id):
    data = request.get_json()
    tasks = load_tasks()
    
    for task in tasks:
        if task['id'] == task_id:
            if 'completed' in data:
                task['completed'] = data['completed']
            if 'title' in data:
                task['title'] = data['title']
                task['priority'] = analyze_priority(data['title'])
            save_tasks(tasks)
            return jsonify(task)
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    tasks = load_tasks()
    tasks = [t for t in tasks if t['id'] != task_id]
    save_tasks(tasks)
    return jsonify({'message': 'Task deleted'}), 200

@app.route('/api/tasks/prioritize', methods=['GET'])
def get_prioritized_tasks():
    tasks = load_tasks()
    incomplete_tasks = [t for t in tasks if not t['completed']]
    completed_tasks = [t for t in tasks if t['completed']]
    
    sorted_incomplete = sorted(
        incomplete_tasks, 
        key=lambda x: (-x['priority']['score'], x['created_at'])
    )
    
    return jsonify({
        'prioritized': sorted_incomplete,
        'completed': completed_tasks,
        'suggestion': get_smart_suggestion(sorted_incomplete)
    })

def get_smart_suggestion(tasks):
    if not tasks:
        return "All caught up! Add some tasks to get started."
    
    urgent_count = sum(1 for t in tasks if t['priority']['level'] == 'urgent')
    high_count = sum(1 for t in tasks if t['priority']['level'] == 'high')
    
    if urgent_count > 0:
        return f"Focus mode: You have {urgent_count} urgent task(s) requiring immediate attention!"
    elif high_count > 0:
        return f"Priority alert: {high_count} high-priority task(s) should be tackled first."
    elif len(tasks) > 5:
        return "Tip: Consider breaking down your tasks into smaller, manageable chunks."
    else:
        return "You're on track! Complete tasks in the suggested order for optimal productivity."

@app.route('/api/stats', methods=['GET'])
def get_stats():
    tasks = load_tasks()
    total = len(tasks)
    completed = sum(1 for t in tasks if t['completed'])
    pending = total - completed
    
    priority_breakdown = {
        'urgent': sum(1 for t in tasks if not t['completed'] and t['priority']['level'] == 'urgent'),
        'high': sum(1 for t in tasks if not t['completed'] and t['priority']['level'] == 'high'),
        'medium': sum(1 for t in tasks if not t['completed'] and t['priority']['level'] == 'medium'),
        'normal': sum(1 for t in tasks if not t['completed'] and t['priority']['level'] == 'normal')
    }
    
    return jsonify({
        'total': total,
        'completed': completed,
        'pending': pending,
        'percentage': round((completed / total * 100) if total > 0 else 0, 1),
        'priority_breakdown': priority_breakdown
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
