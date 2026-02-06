from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from db.session import get_db
from models.database import User, UserRole, Document
from api.documents import get_current_user

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(User).all()

@router.delete("/documents/{doc_id}")
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete(doc)
    db.commit()
    # Ideally, also delete from vector store
    from services.vector_service import VectorService
    VectorService().delete_by_document(str(doc_id))
    
@router.post("/reindex")
def reindex_all_documents(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    from services.vector_service import VectorService
    from api.documents import process_document_task
    import os
    
    # 1. Reset vector collection
    vs = VectorService()
    vs.reset_collection()
    
    # 2. Re-process all documents in DB
    docs = db.query(Document).all()
    upload_dir = "./uploads"
    
    reindexed_count = 0
    for doc in docs:
        # Find the actual file path
        # Note: In a real app we'd store the exact path, but here we can search
        files = os.listdir(upload_dir)
        matching_files = [f for f in files if f.endswith(f"_{doc.filename}")]
        
        if matching_files:
            file_path = os.path.join(upload_dir, matching_files[0])
            doc.processed = 0 # Mark as pending
            db.commit()
            background_tasks.add_task(process_document_task, doc.id, file_path, db)
            reindexed_count += 1
            
    return {"message": f"Re-indexing started for {reindexed_count} documents."}
