# backend/services/explainer.py

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from backend.core.config import settings

SYSTEM_PROMPT = """You are an expert programming tutor and code analyst.
Your job is to provide clear, detailed explanations of code and programming concepts.

When explaining code, always cover:
- What the code does at a high level
- How it works step by step
- The algorithms or data structures involved
- Time and space complexity where relevant
- Any notable design decisions or patterns used
- Potential edge cases or limitations

When explaining a concept, cover:
- A clear definition
- How it works internally
- When and why you would use it
- A brief illustrative example

Write in clear, precise prose. Do not generate new code unless a tiny inline snippet
is absolutely necessary to illustrate a point."""

USER_PROMPT = """Request: {query}

{file_context}

Explanation:"""


class CodeExplainer:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL,
            openai_api_key=settings.OPENROUTER_API_KEY,
            openai_api_base=settings.OPENROUTER_BASE_URL,
            temperature=0.3,
        )
        self.chain = (
            ChatPromptTemplate.from_messages([
                ("system", SYSTEM_PROMPT),
                ("human", USER_PROMPT),
            ])
            | self.llm
            | StrOutputParser()
        )

    def explain(self, query: str, file_content: str | None = None) -> str:
        file_context = (
            f"The user has provided the following code:\n```\n{file_content}\n```"
            if file_content
            else ""
        )
        return self.chain.invoke({
            "query": query,
            "file_context": file_context,
        })