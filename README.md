# AuraMind v2.0 - Internal AI Knowledge Assistant

AuraMind is a high-performance Retrieval-Augmented Generation (RAG) platform designed for secure internal documentation analysis. Built with Next.js, FastAPI, and local AI engines, it provides sub-second document retrieval and instant streaming responses.

![Landing Page Logo](https://raw.githubusercontent.com/username/project/main/logo.png)

## 🚀 Key Features

- **Sub-Second Knowledge Retrieval**: Integrated with `SentenceTransformers` for near-instant search results.
- **Zero-Latency Streaming**: Answers appear word-by-word in real-time via Server-Sent Events (SSE).
- **Secure Architecture**: Local document processing with no external data exposure for embeddings.
- **Persistent Memory**: Full chat history and conversation management with SQLite persistence.
- **Enterprise Design**: Premium glassmorphism UI with responsive dashboard and secure authentication.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Framer Motion, Lucide React.
- **Backend**: FastAPI (Python), SQLAlchemy, Pydantic.
- **Vector Engine**: ChromaDB with local `all-MiniLM-L6-v2` embeddings.
- **AI Orchestration**: Ollama (Llama3) for high-reasoning local generation.
- **Security**: JWT-based Authentication, Environment Secret Masking.

## 📦 Installation & Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com/) (installed and running)

### 2. AI Engine Setup
Pull the required models:
```bash
ollama pull llama3
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Update with your custom SECRET_KEY
uvicorn main:app --reload
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🛡️ Best Practices Applied
- **Async Execution**: Non-blocking I/O for all AI and Database operations.
- **Local-First**: 100% data privacy with local embedding generation.
- **SSE Streams**: Managed state for real-time response dehydration.

## 📄 License
MIT License. Created by Adithya as Case Study for Advanced RAG Architectures.
