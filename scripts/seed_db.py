# scripts/seed_db.py

from datasets import load_dataset
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.services.knowledge_base import KnowledgeBase


DATASET_NAME = "openai/openai_humaneval"
DATASET_SPLIT = "test"


def build_chunk(prompt: str, canonical_solution: str) -> str:
    return f"Problem: {prompt}\n\nSolution:\n{canonical_solution}"


def main():
    print("Loading HumanEval dataset...")
    dataset = load_dataset(DATASET_NAME, split=DATASET_SPLIT)

    print(f"Building chunks from {len(dataset)} examples...")
    chunks = [
        build_chunk(row["prompt"], row["canonical_solution"])
        for row in dataset
    ]

    print("Seeding FAISS index...")
    kb = KnowledgeBase()
    kb.seed(chunks)

    print(f"Done. {len(chunks)} chunks embedded and saved to disk.")


if __name__ == "__main__":
    main()