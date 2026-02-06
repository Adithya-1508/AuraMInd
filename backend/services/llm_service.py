from abc import ABC, abstractmethod
import requests
import httpx
import json
from typing import List, Dict, Any, Optional, AsyncGenerator

class LLMClient(ABC):
    @abstractmethod
    async def generate_stream(self, prompt: str, context: Optional[List[str]] = None) -> AsyncGenerator[str, None]:
        """Stream responses from the LLM."""
        pass

    @abstractmethod
    async def get_embeddings(self, text: str) -> List[float]:
        """Generate embeddings for the given text."""
        pass

class OllamaClient(LLMClient):
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3", embed_model: str = "llama3"):
        self.base_url = base_url
        self.model = model
        self.embed_model = embed_model
        self.headers = {"Content-Type": "application/json"}

    async def generate_stream(self, prompt: str, context: Optional[List[str]] = None) -> AsyncGenerator[str, None]:
        url = f"{self.base_url}/api/generate"
        system_prompt = "You are AuraMind Assistant, a secure internal knowledge AI. Answer based ONLY on the PROVIDED CONTEXT. Chunks are prefixed with 'Source: filename'. Always specify which document you are citing by its filename. If information is missing from the context, state that it is not found in the uploaded documents."
        
        full_prompt = prompt
        if context:
            context_str = "\n\n".join(context)
            full_prompt = f"Context:\n{context_str}\n\nQuestion: {prompt}"

        payload = {
            "model": self.model,
            "prompt": full_prompt,
            "system": system_prompt,
            "stream": True,
            "options": {"temperature": 0.0}
        }

        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", url, json=payload) as response:
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                        if "response" in data:
                            yield data["response"]
                        if data.get("done"):
                            break
                    except json.JSONDecodeError:
                        continue

    async def get_embeddings(self, text: str) -> List[float]:
        url = f"{self.base_url}/api/embeddings"
        payload = {
            "model": self.embed_model,
            "prompt": text
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                return response.json().get("embedding", [])
            except Exception as e:
                print(f"Error getting embeddings: {e}")
                return []
