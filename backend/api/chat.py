from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
import json
from sqlalchemy.orm import Session
from db.session import get_db
from services.llm_service import OllamaClient
from services.vector_service import VectorService
from api.documents import get_current_user
from models.database import User, Conversation, Message as DBMessage
from pydantic import BaseModel

router = APIRouter()
llm_client = OllamaClient()
vector_service = VectorService()

class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[int] = None

from fastapi.responses import StreamingResponse

@router.post("/query")
async def query_rag(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    async def event_generator():
        # 1. Retrieve relevant chunks
        results = await vector_service.search(request.query, n_results=5)
        
        if not results:
            yield f"data: {json.dumps({'error': 'No relevant context found.'})}\n\n"
            return

        # 2. Extract context and citations
        contexts = [r['content'] for r in results]
        citations = []
        for r in results:
            citations.append({
                "content": r['content'][:200] + "...", 
                "pages": r['metadata'].get('pages', 'Unknown'),
                "document_name": r['metadata'].get('filename', 'Unknown'),
                "document_id": r['metadata'].get('document_id')
            })

        # Send citations first
        yield f"data: {json.dumps({'type': 'citations', 'citations': citations})}\n\n"

        # 3. Generate answer using LLM streaming
        full_answer = ""
        async for chunk in llm_client.generate_stream(request.query, context=contexts):
            full_answer += chunk
            yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"

        # 4. Save to database once finished
        if request.conversation_id:
            try:
                # Save User Message
                user_msg = DBMessage(
                    role="user",
                    content=request.query,
                    conversation_id=request.conversation_id
                )
                db.add(user_msg)
                
                # Save Bot Message
                bot_msg = DBMessage(
                    role="bot",
                    content=full_answer,
                    citations=json.dumps(citations),
                    conversation_id=request.conversation_id
                )
                db.add(bot_msg)
                db.commit()
            except Exception as e:
                print(f"Error saving to history: {e}")

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
