from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.agents.fan_assistant import FanAssistantAgent
from app.rag.embeddings import EmbeddingService
from app.core.config import settings
from app.core.llm import get_random_gemini_key

router = APIRouter()

# Initialize services (lazy singletons)
_embedding_service: Optional[EmbeddingService] = None
_fan_assistant: Optional[FanAssistantAgent] = None


def get_embedding_service() -> EmbeddingService:
    global _embedding_service
    if _embedding_service is None:
        api_key = get_random_gemini_key()
        _embedding_service = EmbeddingService(api_key=api_key if api_key else None)
    return _embedding_service


def get_fan_assistant() -> FanAssistantAgent:
    global _fan_assistant
    if _fan_assistant is None:
        api_key = get_random_gemini_key()
        _fan_assistant = FanAssistantAgent(
            embedding_service=get_embedding_service(),
            api_key=api_key if api_key else None
        )
    return _fan_assistant


class FanAssistantQuery(BaseModel):
    query: str
    universe: Optional[str] = None


class FanAssistantResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    universe: Optional[str]
    query: str


@router.post("/ask", response_model=FanAssistantResponse)
async def ask_fan_assistant(request: FanAssistantQuery):
    """
    Ask the Fan Assistant a fandom question.
    Uses RAG to retrieve relevant knowledge and generate an answer.
    """
    agent = get_fan_assistant()
    result = await agent.answer(query=request.query, universe=request.universe)
    return result


@router.get("/knowledge/stats")
async def get_knowledge_stats():
    """Get statistics about the current knowledge base."""
    from app.rag.vector_store import get_vector_store
    store = get_vector_store()
    
    # Count documents by universe
    universe_counts: Dict[str, int] = {}
    for doc in store.documents:
        universe = doc.metadata.get("universe", "unknown")
        universe_counts[universe] = universe_counts.get(universe, 0) + 1
    
    return {
        "total_documents": len(store.documents),
        "universes": universe_counts,
    }
