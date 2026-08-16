"""
Ingestion pipeline for SuperFan AI fandom knowledge.

Loads raw fandom knowledge documents, chunks them,
generates embeddings, and stores them in the vector database.
"""
import json
import logging
import uuid
from pathlib import Path
from typing import List, Dict, Any

from app.rag.vector_store import VectorDocument, get_vector_store
from app.rag.embeddings import EmbeddingService

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data"


def load_fandom_knowledge() -> List[Dict[str, Any]]:
    """Load the seed fandom knowledge from JSON."""
    knowledge_file = DATA_DIR / "fandom_knowledge.json"
    if not knowledge_file.exists():
        logger.warning(f"Knowledge file not found at {knowledge_file}")
        return []
    
    with open(knowledge_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    logger.info(f"Loaded {len(data)} fandom knowledge documents.")
    return data


def chunk_document(doc: Dict[str, Any], max_chunk_size: int = 500) -> List[Dict[str, Any]]:
    """
    Split a document into smaller chunks if needed.
    For our seed data, most documents are already small enough,
    but this function handles larger documents that may be added later.
    """
    content = doc.get("content", "")
    
    if len(content) <= max_chunk_size:
        return [doc]
    
    # Simple sentence-based chunking
    sentences = content.replace(". ", ".\n").split("\n")
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) > max_chunk_size and current_chunk:
            chunk_doc = doc.copy()
            chunk_doc["content"] = current_chunk.strip()
            chunk_doc["chunk_index"] = len(chunks)
            chunks.append(chunk_doc)
            current_chunk = sentence
        else:
            current_chunk += " " + sentence if current_chunk else sentence
    
    if current_chunk.strip():
        chunk_doc = doc.copy()
        chunk_doc["content"] = current_chunk.strip()
        chunk_doc["chunk_index"] = len(chunks)
        chunks.append(chunk_doc)
    
    return chunks


async def ingest_fandom_knowledge(embedding_service: EmbeddingService) -> int:
    """
    Full ingestion pipeline: Load → Chunk → Embed → Store.
    Returns the number of documents ingested.
    """
    raw_docs = load_fandom_knowledge()
    if not raw_docs:
        return 0
    
    # Chunk documents
    all_chunks = []
    for doc in raw_docs:
        chunks = chunk_document(doc)
        all_chunks.extend(chunks)
    
    logger.info(f"Chunked into {len(all_chunks)} segments.")
    
    # Extract texts for batch embedding
    texts = [chunk["content"] for chunk in all_chunks]
    
    # Generate embeddings
    embeddings = await embedding_service.embed_batch(texts)
    
    # Create vector documents
    vector_docs = []
    for i, chunk in enumerate(all_chunks):
        doc_id = f"{chunk.get('universe', 'unknown')}_{chunk.get('title', 'untitled')}_{i}"
        
        metadata = {
            "universe": chunk.get("universe", ""),
            "title": chunk.get("title", ""),
            "tags": chunk.get("tags", []),
            "character": chunk.get("character"),
            "content_type": chunk.get("content_type", ""),
            "chunk_index": chunk.get("chunk_index", 0),
        }
        
        vector_docs.append(VectorDocument(
            id=doc_id,
            content=chunk["content"],
            metadata=metadata,
            embedding=embeddings[i] if i < len(embeddings) else []
        ))
    
    # Store in vector database
    store = get_vector_store()
    store.add_documents(vector_docs)
    
    logger.info(f"Ingestion complete. {len(vector_docs)} documents stored.")
    return len(vector_docs)
