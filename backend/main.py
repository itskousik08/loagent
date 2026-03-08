from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import requests
import os
from agent import chat_with_loagent
from github_tools import upload_to_github

app = FastAPI(title="Loagent API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    model: str

class GithubRequest(BaseModel):
    token: str
    repo_name: str
    file_path: str
    content: str

# 1. Auto-Fetch Ollama Models API
@app.get("/api/models")
def get_ollama_models():
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code == 200:
            models = response.json().get("models",[])
            return {"models": [model["name"] for model in models]}
        return {"models":[]}
    except Exception as e:
        return {"models":[]}

# 2. Chat API
@app.post("/api/chat")
async def chat(request: ChatRequest):
    response = chat_with_loagent(request.message, request.model)
    return {"reply": response}

# 3. Working GitHub Push API
@app.post("/api/github/push")
async def github_push(request: GithubRequest):
    result = upload_to_github(request.token, request.repo_name, request.file_path, "Updated via Loagent", request.content)
    return {"status": result}

# 4. Serve Frontend (Professional Single-Port Setup)
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
