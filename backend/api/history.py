from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from db.session import get_db
from models.database import User, Conversation, Message as DBMessage
from api.documents import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ConversationSchema(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

class MessageSchema(BaseModel):
    role: str
    content: str
    citations: str | None
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/conversations", response_model=List[ConversationSchema])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.created_at.desc()).all()

@router.get("/conversations/{conv_id}/messages", response_model=List[MessageSchema])
def get_messages(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv.messages

@router.post("/conversations")
def create_conversation(
    title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_conv = Conversation(title=title, user_id=current_user.id)
    db.add(new_conv)
    db.commit()
    db.refresh(new_conv)
    return new_conv

@router.delete("/conversations/{conv_id}")
def delete_conversation(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted"}
