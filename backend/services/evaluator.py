# backend/services/evaluator.py

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from backend.core.config import settings

SYSTEM_PROMPT = """You are a retrieval quality evaluator for a coding assistant.
You will be given a user's coding request and a set of retrieved documents from a knowledge base.
Your only job is to decide whether the retrieved documents are relevant enough to help answer the request.

Rules:
- If the retrieved documents contain code examples, patterns, or explanations that are directly useful for the user's request, respond with: relevant
- If the retrieved documents are off-topic, too generic, or would not meaningfully help generate a good answer, respond with: irrelevant
- Respond with exactly one word: either relevant or irrelevant. Nothing else."""

USER_PROMPT = """User request: {query}

Retrieved documents:
{retrieved_docs}

Verdict:"""


class RetrievalEvaluator:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL,
            openai_api_key=settings.OPENROUTER_API_KEY,
            openai_api_base=settings.OPENROUTER_BASE_URL,
            temperature=0,
        )
        self.chain = (
            ChatPromptTemplate.from_messages([
                ("system", SYSTEM_PROMPT),
                ("human", USER_PROMPT),
            ])
            | self.llm
            | StrOutputParser()
        )

    def is_relevant(self, query: str, retrieved_docs: list[str]) -> bool:
        if not retrieved_docs:
            return False

        formatted_docs = "\n\n---\n\n".join(
            f"Document {i + 1}:\n{doc}"
            for i, doc in enumerate(retrieved_docs)
        )
        result = self.chain.invoke({
            "query": query,
            "retrieved_docs": formatted_docs,
        })
        return result.strip().lower() == "relevant"