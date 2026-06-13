from abc import ABC, abstractmethod
import os
import httpx
import json
from typing import List, Dict, Any, Optional, AsyncGenerator

# Shared default system prompt for grounded RAG answers.
DEFAULT_SYSTEM_PROMPT = (
    "You are AuraMind Assistant, a secure internal knowledge AI. Answer based ONLY on the "
    "PROVIDED CONTEXT. Chunks are prefixed with 'Source: filename'. Always specify which "
    "document you are citing by its filename. If information is missing from the context, "
    "state that it is not found in the uploaded documents."
)

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
        system_prompt = os.getenv("SYSTEM_PROMPT", DEFAULT_SYSTEM_PROMPT)
        
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
        """
        [DEPRECATED] Generate embeddings using Ollama.
        Project now uses local SentenceTransformers via EmbeddingService.
        """
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
                print(f"Error getting legacy embeddings: {e}")
                return []


class NvidiaClient(LLMClient):
    """Chat client for NVIDIA NIM (build.nvidia.com).

    NVIDIA exposes an OpenAI-compatible API, so we drive it with the official
    `openai` async SDK. The model is just a config string: set NVIDIA_MODEL to
    switch between models with zero code changes, e.g.
        minimaxai/minimax-m2.7  (default — fastest, 10B active params)
        moonshotai/kimi-k2.6
        minimaxai/minimax-m3
    Embeddings remain local (EmbeddingService); this client only generates.
    """

    def __init__(self):
        self.base_url = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
        self.model = os.getenv("NVIDIA_MODEL", "minimaxai/minimax-m2.7")
        self.api_key = os.getenv("NVIDIA_API_KEY")
        self._client = None
        if self.api_key:
            # Import lazily so the app can still run with LLM_PROVIDER=ollama
            # (or without `openai` installed) when NVIDIA isn't in use.
            from openai import AsyncOpenAI
            self._client = AsyncOpenAI(base_url=self.base_url, api_key=self.api_key)

    async def generate_stream(self, prompt: str, context: Optional[List[str]] = None) -> AsyncGenerator[str, None]:
        if not self._client:
            yield (
                "Configuration error: NVIDIA_API_KEY is not set. Add it to backend/.env "
                "(get a key at https://build.nvidia.com/settings/api-keys)."
            )
            return

        system_prompt = os.getenv("SYSTEM_PROMPT", DEFAULT_SYSTEM_PROMPT)
        if context:
            context_str = "\n\n".join(context)
            user_content = f"Context:\n{context_str}\n\nQuestion: {prompt}"
        else:
            user_content = prompt

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ]

        try:
            stream = await self._client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=True,
                temperature=0.0,
            )
            async for chunk in stream:
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta
        except Exception as e:
            # The OpenAI SDK attaches HTTP status on API errors; surface the
            # common ones (auth / rate limit) as a readable message.
            status = getattr(e, "status_code", None)
            if status == 401:
                yield "Authentication failed: check your NVIDIA_API_KEY in backend/.env."
            elif status == 429:
                yield "Rate limit reached (NVIDIA free tier allows 40 requests/min). Please wait a moment and retry."
            else:
                print(f"NVIDIA generation error: {e}")
                yield "Sorry, the AI engine returned an error. Please try again shortly."

    async def get_embeddings(self, text: str) -> List[float]:
        raise NotImplementedError(
            "Embeddings are generated locally via EmbeddingService, not the NVIDIA client."
        )


def get_llm_client() -> LLMClient:
    """Factory: pick the LLM provider from the LLM_PROVIDER env var.

    Defaults to NVIDIA NIM. Set LLM_PROVIDER=ollama to fall back to a local
    Ollama install. The rest of the app depends only on the LLMClient
    interface, so swapping providers needs no other code changes.
    """
    provider = os.getenv("LLM_PROVIDER", "nvidia").lower()
    if provider == "ollama":
        return OllamaClient(
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            model=os.getenv("LLM_MODEL", "llama3"),
        )
    return NvidiaClient()
