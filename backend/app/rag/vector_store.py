"""
Vector Store Abstraction Layer for SuperFan AI.

Provides a unified interface for different vector database backends.
Defaults to a simple in-memory store for zero-cost development.
Can be swapped for ChromaDB, FAISS, or Pinecone via configuration.
"""
import json
import math
import os
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class VectorDocument:
    """Represents a document stored in the vector database."""
    def __init__(self, id: str, content: str, metadata: Dict[str, Any], embedding: Optional[List[float]] = None):
        self.id = id
        self.content = content
        self.metadata = metadata
        self.embedding = embedding or []


class InMemoryVectorStore:
    """
    A simple in-memory vector store using cosine similarity.
    This is the zero-cost development fallback — no external dependencies needed.
    """
    def __init__(self):
        self.documents: List[VectorDocument] = []
        logger.info("InMemoryVectorStore initialized (zero-cost dev mode).")

    def add_documents(self, documents: List[VectorDocument]):
        self.documents.extend(documents)
        logger.info(f"Added {len(documents)} documents. Total: {len(self.documents)}.")

    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        if not a or not b or len(a) != len(b):
            return 0.0
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(x * x for x in b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def search(self, query_embedding: List[float], top_k: int = 5, 
               filter_metadata: Optional[Dict[str, str]] = None) -> List[VectorDocument]:
        candidates = self.documents
        
        # Apply metadata filters
        if filter_metadata:
            for key, value in filter_metadata.items():
                candidates = [d for d in candidates if d.metadata.get(key) == value]

        if not query_embedding:
            # If no embedding, do keyword fallback (return first top_k)
            return candidates[:top_k]

        scored = []
        for doc in candidates:
            score = self._cosine_similarity(query_embedding, doc.embedding)
            scored.append((score, doc))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored[:top_k]]

    def search_by_keyword(self, query: str, top_k: int = 5, 
                          universe: Optional[str] = None) -> List[VectorDocument]:
        """Simple keyword-based search fallback when embeddings are unavailable."""
        query_lower = query.lower()
        query_terms = query_lower.split()
        
        candidates = self.documents
        if universe:
            candidates = [d for d in candidates if d.metadata.get("universe") == universe]

        scored = []
        for doc in candidates:
            content_lower = doc.content.lower()
            title_lower = doc.metadata.get("title", "").lower()
            tags = [t.lower() for t in doc.metadata.get("tags", [])]

            score = 0
            for term in query_terms:
                if term in title_lower:
                    score += 3
                if term in tags:
                    score += 2
                if term in content_lower:
                    score += 1
            
            if score > 0:
                scored.append((score, doc))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored[:top_k]]


# Global vector store singleton
_vector_store: Optional[InMemoryVectorStore] = None


def get_vector_store() -> InMemoryVectorStore:
    global _vector_store
    if _vector_store is None:
        _vector_store = InMemoryVectorStore()
    return _vector_store
