from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.universes import router as universes_router
from app.api.chat import router as chat_router
from app.api.characters import router as characters_router
from app.api.content import router as content_router
from app.api.quiz import router as quiz_router
from app.api.community import router as community_router
from app.api.memory import router as memory_router
from app.api.story import router as story_router
from app.api.recommendations import router as recommendations_router
from app.api.generate import router as generate_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    
    # Ingest fandom knowledge into vector store
    import logging
    logger = logging.getLogger(__name__)
    try:
        from app.rag.ingestion import ingest_fandom_knowledge
        from app.api.chat import get_embedding_service
        count = await ingest_fandom_knowledge(get_embedding_service())
        logger.info(f"RAG: Ingested {count} fandom knowledge documents.")
    except Exception as e:
        logger.warning(f"RAG ingestion failed (non-fatal): {e}")
    
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="SuperFan AI API",
    description="Backend API for SuperFan AI Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/v1/users", tags=["Users"])
app.include_router(universes_router, prefix="/api/v1/universes", tags=["Universes"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Fan Assistant"])
app.include_router(characters_router, prefix="/api/v1/characters", tags=["Character AI"])
app.include_router(content_router, prefix="/api/v1/content", tags=["Content Generation"])
app.include_router(quiz_router, prefix="/api/v1/quiz", tags=["Quiz"])
app.include_router(community_router, prefix="/api/v1/community", tags=["Community"])
app.include_router(memory_router, prefix="/api/v1/memory", tags=["Fan Memory"])
app.include_router(story_router, prefix="/api/v1/story", tags=["story"])
app.include_router(recommendations_router, prefix="/api/v1/recommendations", tags=["recommendations"])
app.include_router(generate_router, prefix="/api/v1/generate", tags=["generate"])

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "message": "SuperFan AI API is running."}
