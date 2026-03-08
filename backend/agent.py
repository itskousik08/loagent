import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"

SYSTEM_PROMPT = """
You are 'Loagent', an elite, professional AI software engineer and agent creator.
Tumhara kaam users ke liye high-quality websites, scripts, aur AI agents banana hai.

WORKFLOW RULES:
1. THINKING: Pehle step-by-step socho ki kya banana hai.
2. DOUBTS: Agar user ki requirement me kuch clear nahi hai, toh directly code mat likho, pehle 2-3 specific options de kar user se pucho.
3. ACTION: Jab sab clear ho, toh high-quality, production-ready code likho.
4. GITHUB: Jab user bole, toh code ko GitHub par push karne ka format ready karo.

Apne answer ko in sections me divide karo:
[THOUGHT PROCESS] - Tumhara internal logic.[QUESTIONS/OPTIONS] - Agar user se kuch puchna hai (optional).
[CODE/ACTION] - Tumhara final code.
"""

def chat_with_loagent(prompt, model="llama3"):
    data = {
        "model": model,
        "prompt": f"{SYSTEM_PROMPT}\n\nUser Request: {prompt}",
        "stream": False
    }
    
    response = requests.post(OLLAMA_URL, json=data)
    if response.status_code == 200:
        return response.json()['response']
    else:
        return "Error connecting to Ollama!"
