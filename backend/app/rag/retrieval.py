"""
Retrieval module for SuperFan AI RAG pipeline.

Given a user query and optional universe context, retrieves
the most relevant fandom knowledge documents.
"""
import logging
from typing import List, Optional, Dict, Any

from app.rag.vector_store import VectorDocument, get_vector_store
from app.rag.embeddings import EmbeddingService

logger = logging.getLogger(__name__)


async def retrieve_context(
    query: str,
    embedding_service: EmbeddingService,
    universe: Optional[str] = None,
    top_k: int = 3,
) -> List[Dict[str, Any]]:
    """
    Retrieve relevant context documents for a query.
    
    Uses semantic search (embedding similarity) when embeddings are available,
    with keyword search as fallback.
    """
    store = get_vector_store()
    
    # Try semantic search first
    try:
        query_embedding = await embedding_service.embed_query(query)
        
        filter_metadata = {}
        if universe:
            filter_metadata["universe"] = universe
        
        results = store.search(
            query_embedding=query_embedding,
            top_k=top_k,
            filter_metadata=filter_metadata if filter_metadata else None
        )
    except Exception as e:
        logger.warning(f"Semantic search failed: {e}. Falling back to keyword search.")
        results = store.search_by_keyword(query, top_k=top_k, universe=universe)
    
    # If semantic search returns nothing, try keyword
    if not results:
        results = store.search_by_keyword(query, top_k=top_k, universe=universe)
    
    # Format results
    context_docs = []
    for doc in results:
        context_docs.append({
            "title": doc.metadata.get("title", "Unknown"),
            "content": doc.content,
            "universe": doc.metadata.get("universe", ""),
            "content_type": doc.metadata.get("content_type", ""),
            "tags": doc.metadata.get("tags", []),
        })
    
    logger.info(f"Retrieved {len(context_docs)} context documents for query: '{query[:50]}...'")
    return context_docs


def format_context_for_prompt(context_docs: List[Dict[str, Any]]) -> str:
    """Format retrieved documents into a prompt-friendly context block."""
    if not context_docs:
        return "No relevant knowledge found in the database."
    
    sections = []
    for i, doc in enumerate(context_docs, 1):
        section = f"--- Source {i}: {doc['title']} ---\n{doc['content']}"
        sections.append(section)
    
    return "\n\n".join(sections)
