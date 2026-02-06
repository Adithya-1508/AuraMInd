import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import uuid

class VectorService:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_directory)
        # Switch to a new collection version for 384-dim embeddings
        self.collection = self.client.get_or_create_collection(name="document_chunks_v2")
        from services.embedding_service import EmbeddingService
        self.embedding_service = EmbeddingService()

    def add_chunks(self, chunks: List[str], metadatas: List[Dict[str, Any]], embeddings: Optional[List[List[float]]] = None):
        ids = [str(uuid.uuid4()) for _ in chunks]
        self.collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids,
            embeddings=embeddings
        )

    async def search(self, query: str, n_results: int = 5, query_embeddings: Optional[List[List[float]]] = None) -> List[Dict[str, Any]]:
        if not query_embeddings:
            # Generate query embedding using the same model as the collection
            emb = self.embedding_service.get_embeddings(query)
            query_embeddings = [emb]

        results = self.collection.query(
            query_embeddings=query_embeddings,
            n_results=n_results
        )
        
        formatted_results = []
        if results['documents']:
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    "content": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i],
                    "id": results['ids'][0][i]
                })
        return formatted_results

    def delete_by_document(self, document_id: str):
        self.collection.delete(where={"document_id": document_id})

    def reset_collection(self):
        """Clears all data from the collection."""
        self.client.delete_collection("document_chunks")
        self.collection = self.client.get_or_create_collection(name="document_chunks")
