# backend/services/router.py

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from backend.core.config import settings

SYSTEM_PROMPT = """You are a request classifier for a coding assistant.
Your only job is to classify the user's request into one of two categories:

- explanation: the user wants to understand, analyze, or get an explanation of existing code or a programming concept.
- generation: the user wants to generate, write, implement, or create new code.

Rules:
- If the user has provided existing code and is asking about it, always classify as explanation.
- If the user is asking what something is or how something works conceptually, classify as explanation.
- If the user wants you to write, build, implement, or create something, classify as generation.
- Respond with exactly one word: either explanation or generation. Nothing else."""

USER_PROMPT = """Request: {query}

{file_context}

Classification:"""


class LLMRouter:
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

    def classify(self, query: str, file_content: str | None = None) -> str:
        file_context = (
            f"The user has also provided a file with the following content:\n{file_content}"
            if file_content
            else "No file was provided."
        )
        result = self.chain.invoke({
            "query": query,
            "file_context": file_context,
        })
        label = result.strip().lower()
        if label not in ("explanation", "generation"):
            return "explanation"
        return label