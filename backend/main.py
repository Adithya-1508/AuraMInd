from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db.session import init_db, get_db
from api import auth, documents, chat, admin, history
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Internal AI Knowledge Assistant (RAG)")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
def on_startup():
    init_db()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(history.router, prefix="/api/history", tags=["history"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
def read_root():
    return {"message": "Internal AI Knowledge Assistant API is running"}
