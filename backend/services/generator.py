# backend/services/generator.py

import re
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from backend.core.config import settings

SYSTEM_PROMPT_WITH_CONTEXT = """You are an expert software engineer and coding assistant.
You have been provided with relevant code examples and documentation from a knowledge base.
Use them as reference and inspiration — do not copy them verbatim.

Your response must follow this exact format:

```<language>
<your complete code solution here>
```

EXPLANATION:
<a detailed explanation of your implementation covering: what it does, how it works,
algorithms and data structures used, time and space complexity, libraries used,
and how to use it>"""

SYSTEM_PROMPT_WITHOUT_CONTEXT = """You are an expert software engineer and coding assistant.
Generate a complete, working code solution for the user's request.

Your response must follow this exact format:

```<language>
<your complete code solution here>
```

EXPLANATION:
<a detailed explanation of your implementation covering: what it does, how it works,
algorithms and data structures used, time and space complexity, libraries used,
and how to use it>"""

USER_PROMPT_WITH_CONTEXT = """Relevant examples from knowledge base:
{context}

User request: {query}"""

USER_PROMPT_WITHOUT_CONTEXT = """User request: {query}"""


class CodeGenerator:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL,
            openai_api_key=settings.OPENROUTER_API_KEY,
            openai_api_base=settings.OPENROUTER_BASE_URL,
            temperature=0.2,
        )
        self.chain_with_context = (
            ChatPromptTemplate.from_messages([
                ("system", SYSTEM_PROMPT_WITH_CONTEXT),
                ("human", USER_PROMPT_WITH_CONTEXT),
            ])
            | self.llm
            | StrOutputParser()
        )
        self.chain_without_context = (
            ChatPromptTemplate.from_messages([
                ("system", SYSTEM_PROMPT_WITHOUT_CONTEXT),
                ("human", USER_PROMPT_WITHOUT_CONTEXT),
            ])
            | self.llm
            | StrOutputParser()
        )

    def generate(
        self,
        query: str,
        context: list[str] | None = None,
    ) -> tuple[str, str]:
        if context:
            formatted_context = "\n\n---\n\n".join(
                f"Example {i + 1}:\n{doc}"
                for i, doc in enumerate(context)
            )
            raw = self.chain_with_context.invoke({
                "query": query,
                "context": formatted_context,
            })
        else:
            raw = self.chain_without_context.invoke({"query": query})

        code, explanation = self._parse_response(raw)
        return code, explanation

    def _parse_response(self, raw: str) -> tuple[str, str]:
        code_match = re.search(r"```(?:\w+)?\n(.*?)```", raw, re.DOTALL)
        code = code_match.group(1).strip() if code_match else raw.strip()

        explanation = ""
        if "EXPLANATION:" in raw:
            explanation = raw.split("EXPLANATION:", 1)[1].strip()

        return code, explanation