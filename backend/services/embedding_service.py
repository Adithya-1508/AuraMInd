from sentence_transformers import SentenceTransformer
import torch
import numpy as np
from typing import List

class EmbeddingService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        if self._initialized:
            return
        # Use CPU for lightweight operations, but use GPU if available
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = SentenceTransformer(model_name, device=self.device)
        self._initialized = True
        print(f"EmbeddingService initialized with model: {model_name} on {self.device}")

    def get_embeddings(self, text: str) -> List[float]:
        """Generate embedding for a single string."""
        embedding = self.model.encode(text)
        return embedding.tolist()

    def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of strings."""
        embeddings = self.model.encode(texts)
        return embeddings.tolist()
