# Task 7: Adaptive Code Intelligence Assistant

An AI-powered programming assistant that automatically determines whether a user's request requires code generation or code explanation, using a self-learning RAG pipeline.

---

## Overview

When a user submits a query, the system:

1. **Routes** the request — an LLM classifier decides whether the query is a code explanation or code generation task
2. **Explains** directly — if it's an explanation, the query goes straight to the LLM with no retrieval
3. **Generates with RAG** — if it's generation, the system searches a FAISS vector database for relevant examples, evaluates their quality, and generates code with or without retrieved context
4. **Self-learns** — every generated solution is automatically embedded and inserted back into the knowledge base, so future queries benefit from past generations

---

## Architecture

```
User Query
    │
    ▼
LLM Router (classify intent)
    │
    ├── explanation ──► CodeExplainer ──► Response
    │
    └── generation
            │
            ▼
        KnowledgeBase.search()
            │
            ▼
        RetrievalEvaluator (relevant?)
            │
            ├── YES ──► CodeGenerator (with context)
            │                   │
            └── NO  ──► CodeGenerator (standalone)
                                │
                                ▼
                        KnowledgeBase.upsert() ← self-learning
                                │
                                ▼
                            Response
```

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS + Vite |
| Backend | FastAPI + Uvicorn |
| LLM | OpenRouter (via LangChain) |
| Vector Store | FAISS (LangChain wrapper) |
| Embeddings | sentence-transformers `all-MiniLM-L6-v2` |
| Containerization | Docker + Docker Compose |
| Dataset | OpenAI HumanEval (HuggingFace) |

---

## Project Structure

```
adaptive-code-assistant/
│
├── backend/
│   ├── core/
│   │   ├── config.py          # Pydantic settings — reads from .env
│   │   └── logger.py          # Logging setup
│   ├── services/
│   │   ├── router.py          # LLMRouter — classifies intent
│   │   ├── explainer.py       # CodeExplainer — explanation chain
│   │   ├── generator.py       # CodeGenerator — RAG + standalone generation
│   │   ├── evaluator.py       # RetrievalEvaluator — judges retrieved context
│   │   └── knowledge_base.py  # KnowledgeBase — FAISS wrapper
│   ├── data/
│   │   ├── seed/              # Raw HumanEval data
│   │   └── faiss_index/       # Persisted FAISS index (gitignored)
│   └── main.py                # FastAPI app — /chat endpoint
│
├── frontend/
│   └── src/
│       ├── api/chat.js        # sendMessage() — all backend calls
│       ├── components/        # React components
│       └── App.jsx            # Root component — owns all state
│
├── scripts/
│   └── seed_db.py             # One-time FAISS seeding from HumanEval
│
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- An [OpenRouter](https://openrouter.ai) API key

### 1. Clone the repo

```bash
git clone https://github.com/oximas/adaptive-code-assistant.git
cd adaptive-code-assistant
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your key:

```
OPENROUTER_API_KEY=sk-or-v1-yourkey
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=openrouter/auto
```

### 3. Install backend dependencies

```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Seed the knowledge base

```bash
python scripts/seed_db.py
```

This downloads the HumanEval dataset (164 examples), embeds them, and saves the FAISS index to `backend/data/faiss_index/`. Only needs to run once.

### 5. Start the backend

```bash
uvicorn backend.main:app --port 8000 --reload
```

### 6. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Running with Docker

```bash
docker-compose up --build
```

- Frontend: `http://localhost:80`
- Backend: `http://localhost:8000`

> **Note:** The FAISS index is mounted as a volume so it persists across container restarts. Run `seed_db.py` once before starting with Docker.

---

## API

### `POST /chat`

**Request:**
```json
{
  "query": "write a binary search function in Python",
  "filename": "main.py",        
  "file_content": "def foo():..."
}
```

`filename` and `file_content` are optional — plain text queries omit them.

**Response:**
```json
{
  "type": "generation",
  "content": {
    "explanation": "This function implements...",
    "code": "def binary_search(arr, target):..."
  }
}
```

`type` is always `"explanation"` or `"generation"`. `content.code` is `null` for explanations.

---

## Features

- **Intelligent routing** — automatically classifies explanation vs generation with no user input required
- **RAG pipeline** — retrieves relevant code examples from HumanEval knowledge base
- **Retrieval evaluation** — discards irrelevant context before generation
- **Self-learning** — every novel generated solution is embedded and added to the knowledge base
- **File upload** — paste or upload source code files for explanation
- **Syntax highlighting** — code responses rendered with highlight.js
- **Copy code** — one-click copy on all generated code blocks

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENROUTER_API_KEY` | ✅ | — | Your OpenRouter API key |
| `OPENROUTER_BASE_URL` | ❌ | `https://openrouter.ai/api/v1` | OpenRouter base URL |
| `LLM_MODEL` | ❌ | `openrouter/auto` | Model to use for all LLM calls |