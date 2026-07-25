# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.services.router import LLMRouter
from backend.services.explainer import CodeExplainer
from backend.services.generator import CodeGenerator
from backend.services.evaluator import RetrievalEvaluator
from backend.services.knowledge_base import KnowledgeBase

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# instantiate once at startup — not on every request
router = LLMRouter()
explainer = CodeExplainer()
generator = CodeGenerator()
evaluator = RetrievalEvaluator()
kb = KnowledgeBase()


class ChatRequest(BaseModel):
    query: str
    filename: str | None = None
    file_content: str | None = None


class ChatContent(BaseModel):
    explanation: str
    code: str | None = None


class ChatResponse(BaseModel):
    type: str
    content: ChatContent


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    intent = router.classify(req.query, req.file_content)

    if intent == "explanation":
        explanation = explainer.explain(req.query, req.file_content)
        return ChatResponse(
            type="explanation",
            content=ChatContent(explanation=explanation, code=None),
        )

    # generation path
    retrieved_docs = kb.search(req.query)
    context = retrieved_docs if evaluator.is_relevant(req.query, retrieved_docs) else None
    code, explanation = generator.generate(req.query, context=context)

    # self-learning — upsert the new solution into the knowledge base
    kb.upsert(f"Problem: {req.query}\n\nSolution:\n{code}\n\nExplanation:\n{explanation}")

    return ChatResponse(
        type="generation",
        content=ChatContent(explanation=explanation, code=code),
    )