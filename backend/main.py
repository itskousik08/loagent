from fastapi import FastAPI
from pydantic import BaseModel
from agent import chat_with_loagent
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Loagent API")

# CORS so frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    model: str = "llama3"

@app.post("/chat")
async def chat(request: ChatRequest):
    # Loagent ka dimaag process karega
    response = chat_with_loagent(request.message, request.model)
    return {"reply": response}
