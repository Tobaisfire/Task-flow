# Smart Task Board

## Overview
A full-stack task management application with AI-powered smart prioritization.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python Flask REST API
- **Storage**: JSON file persistence (runtime)

## Project Structure
```
/
├── backend/
│   └── app.py          # Flask API server (port 5001)
├── client/
│   ├── src/
│   │   ├── App.jsx     # Main React component
│   │   ├── index.css   # Tailwind styles
│   │   └── main.jsx    # React entry point
│   ├── vite.config.js  # Vite configuration
│   └── package.json    # Node dependencies
├── tasks.json          # Task storage (auto-generated)
└── replit.md           # This file
```

## Features
1. **Task Management**: Add, complete, and delete tasks
2. **Progress Tracking**: Visual progress bar and statistics
3. **AI Prioritization**: Automatic task priority detection based on keywords
4. **Smart Suggestions**: AI-generated productivity tips

## API Endpoints
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Add new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/prioritize` - Get AI-prioritized task list
- `GET /api/stats` - Get task statistics

## Priority Keywords
- **Urgent**: urgent, asap, immediately, critical, emergency
- **High**: important, priority, today, deadline, due, must
- **Medium**: soon, this week, review, update, check
- **Normal**: Default for tasks without priority indicators

## Running the Application
- Frontend runs on port 5000 (Vite dev server)
- Backend runs on port 5001 (Flask API)
- Vite proxies /api requests to Flask backend

## Recent Changes
- December 16, 2025: Initial project setup with React + Flask
- Added AI-powered task prioritization feature
