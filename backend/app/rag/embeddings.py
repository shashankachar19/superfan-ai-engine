"""
Embedding service for SuperFan AI.

Provides an abstraction for generating text embeddings.
Uses Google Gemini embedding API when available, falls back to a simple
TF-IDF-like bag-of-words approach for zero-cost development.
"""
import logging
import math
from typing import List, Optional
from collections import Counter

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Generates text embeddings. Tries Gemini embedding API first,
    falls back to a simple local approach for zero-cost dev.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self._gemini_available = False
        self._vocabulary: List[str] = []

        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self._gemini_available = True
                logger.info("Gemini Embedding API initialized successfully.")
            except Exception as e:
                logger.warning(f"Gemini embedding init failed: {e}. Using local fallback.")
        else:
            logger.info("No API key provided. Using local bag-of-words embeddings.")

    def _tokenize(self, text: str) -> List[str]:
        """Simple whitespace + lowercasing tokenizer."""
        import re
        return re.findall(r'\b\w+\b', text.lower())

    def _build_vocabulary(self, texts: List[str]):
        """Build a shared vocabulary from all texts (for consistent vector dimensions)."""
        all_tokens = set()
        for text in texts:
            all_tokens.update(self._tokenize(text))
        self._vocabulary = sorted(all_tokens)
        logger.info(f"Built vocabulary with {len(self._vocabulary)} terms.")

    def _local_embed(self, text: str) -> List[float]:
        """Simple TF-based embedding using the built vocabulary."""
        tokens = self._tokenize(text)
        counts = Counter(tokens)
        total = len(tokens) if tokens else 1

        vector = []
        for word in self._vocabulary:
            tf = counts.get(word, 0) / total
            vector.append(tf)

        # L2 normalize
        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 0:
            vector = [v / norm for v in vector]

        return vector

    async def embed_text(self, text: str) -> List[float]:
        """Generate an embedding for a single text."""
        if self._gemini_available:
            try:
                import google.generativeai as genai
                result = genai.embed_content(
                    model="models/gemini-embedding-2",
                    content=text,
                    task_type="retrieval_document"
                )
                return result['embedding']
            except Exception as e:
                logger.warning(f"Gemini embed failed: {e}. Falling back to local.")

        return self._local_embed(text)

    async def embed_query(self, text: str) -> List[float]:
        """Generate an embedding for a search query."""
        if self._gemini_available:
            try:
                import google.generativeai as genai
                result = genai.embed_content(
                    model="models/gemini-embedding-2",
                    content=text,
                    task_type="retrieval_query"
                )
                return result['embedding']
            except Exception as e:
                logger.warning(f"Gemini query embed failed: {e}. Falling back to local.")

        return self._local_embed(text)

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embed a batch of texts."""
        if not self._vocabulary:
            self._build_vocabulary(texts)

        results = []
        for text in texts:
            emb = await self.embed_text(text)
            results.append(emb)
        return results
