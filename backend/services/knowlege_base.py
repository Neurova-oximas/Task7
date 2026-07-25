# backend/services/knowledge_base.py

import os
import pickle
from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

INDEX_DIR = Path("backend/data/faiss_index")
INDEX_FILE = INDEX_DIR / "index.faiss"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
TOP_K = 4


class KnowledgeBase:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
        self.store: FAISS | None = None
        self._load()

    def _load(self) -> None:
        if INDEX_FILE.exists():
            self.store = FAISS.load_local(
                folder_path=str(INDEX_DIR),
                embeddings=self.embeddings,
                allow_dangerous_deserialization=True,
            )
        else:
            self.store = None

    def _save(self) -> None:
        INDEX_DIR.mkdir(parents=True, exist_ok=True)
        self.store.save_local(str(INDEX_DIR))

    def search(self, query: str, k: int = TOP_K) -> list[str]:
        if self.store is None:
            return []
        results = self.store.similarity_search(query, k=k)
        return [doc.page_content for doc in results]

    def upsert(self, text: str) -> None:
        if self.store is None:
            self.store = FAISS.from_texts(
                texts=[text],
                embedding=self.embeddings,
            )
        else:
            self.store.add_texts(texts=[text])
        self._save()

    def seed(self, chunks: list[str]) -> None:
        self.store = FAISS.from_texts(
            texts=chunks,
            embedding=self.embeddings,
        )
        self._save()