from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from db.session import get_db
from models.database import Document, User
from services.document_processor import DocumentProcessor
from services.vector_service import VectorService
from api.auth import oauth2_scheme
from core.security import decode_access_token
import shutil
import os
import uuid

router = APIRouter()
doc_processor = DocumentProcessor()
vector_service = VectorService()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == payload["sub"]).first()
    return user

def process_document_task(doc_id: int, file_path: str, db_session: Session):
    try:
        pages = doc_processor.extract_text(file_path)
        chunks = doc_processor.chunk_text(pages)
        
        doc = db_session.query(Document).filter(Document.id == doc_id).first()
        filename = doc.filename if doc else "Unknown"
        
        # Prepend filename to each chunk for better LLM context recognition
        vector_chunks = [f"Source: {filename}\nContent: {c['content']}" for c in chunks]
        metadatas = [{"document_id": str(doc_id), "pages": str(c['pages']), "filename": filename} for c in chunks]
        
        # Use local EmbeddingService for near-instant indexing
        from services.embedding_service import EmbeddingService
        embedding_service = EmbeddingService()
        
        embeddings = embedding_service.get_batch_embeddings(vector_chunks)
        
        vector_service.add_chunks(vector_chunks, metadatas, embeddings=embeddings)
        
        # Mark as processed
        if doc:
            doc.processed = 1
            db_session.commit()
    except Exception as e:
        print(f"Error processing document: {e}")
        doc = db_session.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.processed = -1
            db_session.commit()

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    file_id = str(uuid.uuid4())
    upload_dir = "./uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{file_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    new_doc = Document(
        filename=file.filename,
        uploader_id=current_user.id
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    background_tasks.add_task(process_document_task, new_doc.id, file_path, db)
    
    return {"message": "File uploaded successfully, processing started", "document_id": new_doc.id}

@router.get("/")
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Document).all()
