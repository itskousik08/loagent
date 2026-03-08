#!/bin/bash
echo "🚀 Starting Loagent Environment..."

# Ollama check aur run
echo "Model check kar rahe hain..."
ollama run mistral & 

# Backend start
echo "Backend start ho raha hai..."
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000 &

# Frontend start (Simple HTTP server for UI)
echo "Web interface start ho raha hai..."
cd ../frontend
python -m http.server 3000 &

echo "✅ Loagent is live! Browser me open karo: http://localhost:3000"
