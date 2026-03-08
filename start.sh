#!/bin/bash
echo "🚀 Starting Loagent for Termux..."

# Pehle backend folder me jao
cd backend

# Required libraries install karo
echo "📦 Installing Requirements..."
pip install -r requirements.txt

# Sirf ek server chalana hai (FastAPI port 8000 par frontend bhi serve karega)
echo "🌐 Starting Server..."
uvicorn main:app --host 0.0.0.0 --port 8000 &

echo "========================================="
echo "✅ Loagent is LIVE!"
echo "📱 Apne mobile browser me open karo:"
echo "👉 http://localhost:8000"
echo "========================================="
