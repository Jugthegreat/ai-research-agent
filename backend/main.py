from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import json

from database import get_db, init_db
from models import Chat, Message
from agent import ResearchAgent
from config import settings

app = FastAPI(title="AI Research Agent API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Pydantic models for request/response
class ChatCreate(BaseModel):
    title: Optional[str] = "New Chat"

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    sources: Optional[List[dict]] = None
    thinking: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    id: str
    title: str
    created_at: str
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

# Initialize agent
agent = ResearchAgent()

# Routes

@app.get("/")
async def root():
    return {"message": "AI Research Agent API", "status": "running"}

@app.post("/api/chat", response_model=ChatResponse)
async def create_chat(
    chat: ChatCreate,
    db: Session = Depends(get_db)
):
    """Create a new chat conversation"""
    new_chat = Chat(title=chat.title)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    
    return ChatResponse(
        id=new_chat.id,
        title=new_chat.title,
        created_at=new_chat.created_at.isoformat(),
        messages=[]
    )

@app.get("/api/chat/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: str,
    db: Session = Depends(get_db)
):
    """Get a chat conversation with all messages"""
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    messages = [
        MessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            sources=msg.sources,
            thinking=msg.thinking,
            created_at=msg.created_at.isoformat()
        )
        for msg in chat.messages
    ]
    
    return ChatResponse(
        id=chat.id,
        title=chat.title,
        created_at=chat.created_at.isoformat(),
        messages=messages
    )

@app.post("/api/chat/{chat_id}/message")
async def send_message(
    chat_id: str,
    message: MessageCreate,
    db: Session = Depends(get_db)
):
    """Send a message and get streaming AI response"""
    
    # Verify chat exists
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Save user message
    user_message = Message(
        chat_id=chat_id,
        role="user",
        content=message.content
    )
    db.add(user_message)
    db.commit()
    
    # Get chat history for context
    history = [
        {"role": msg.role, "content": msg.content}
        for msg in chat.messages[:-1]  # Exclude the message we just added
    ]
    
    # Stream AI response
    async def event_generator():
        collected_text = ""
        collected_sources = []
        collected_thinking = ""
        
        async for chunk in agent.research_and_respond(message.content, history):
            # Send each chunk as SSE
            if chunk["type"] == "text":
                collected_text += chunk["content"]
                yield f"data: {json.dumps(chunk)}\n\n"
            
            elif chunk["type"] == "thinking":
                collected_thinking += chunk["content"] + "\n"
                yield f"data: {json.dumps(chunk)}\n\n"
            
            elif chunk["type"] == "done":
                collected_sources = chunk.get("sources", [])
                if chunk.get("thinking"):
                    collected_thinking += chunk["thinking"]
                yield f"data: {json.dumps(chunk)}\n\n"
            
            elif chunk["type"] == "error":
                yield f"data: {json.dumps(chunk)}\n\n"
                return
        
        # Save assistant message to database
        assistant_message = Message(
            chat_id=chat_id,
            role="assistant",
            content=collected_text,
            sources=collected_sources if collected_sources else None,
            thinking=collected_thinking if collected_thinking else None
        )
        db.add(assistant_message)
        db.commit()
        
        # Send final done signal
        yield f"data: {json.dumps({'type': 'complete'})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

@app.get("/api/chats", response_model=List[ChatResponse])
async def list_chats(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """List recent chats"""
    chats = db.query(Chat).order_by(Chat.updated_at.desc()).limit(limit).all()
    
    return [
        ChatResponse(
            id=chat.id,
            title=chat.title,
            created_at=chat.created_at.isoformat(),
            messages=[]
        )
        for chat in chats
    ]