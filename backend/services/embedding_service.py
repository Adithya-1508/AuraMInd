from sentence_transformers import SentenceTransformer
import torch
import numpy as np
from typing import List

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        # Use CPU for lightweight operations, but use GPU if available
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = SentenceTransformer(model_name, device=self.device)
        print(f"EmbeddingService initialized with model: {model_name} on {self.device}")

    def get_embeddings(self, text: str) -> List[float]:
        """Generate embedding for a single string."""
        embedding = self.model.encode(text)
        return embedding.tolist()

    def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of strings."""
        embeddings = self.model.encode(texts)
        return embeddings.tolist()
