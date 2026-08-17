from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.agents.content_agent import ContentAgent
from app.core.config import settings
from app.core.llm import get_random_gemini_key

router = APIRouter()

# Initialize service (lazy singleton)
_content_agent: Optional[ContentAgent] = None

def get_content_agent() -> ContentAgent:
    global _content_agent
    if _content_agent is None:
        api_key = get_random_gemini_key()
        _content_agent = ContentAgent(api_key=api_key if api_key else None)
    return _content_agent

class ContentGenerateRequest(BaseModel):
    universe_name: str
    prompt: str
    content_type: str = "story"

class ContentGenerateResponse(BaseModel):
    content: str
    universe_name: str
    prompt: str
    image_url: Optional[str] = None

@router.post("/generate", response_model=ContentGenerateResponse)
async def generate_content(request: ContentGenerateRequest):
    """
    Generate fandom content (stories, lore) based on a prompt.
    """
    agent = get_content_agent()
    result = await agent.generate_content(
        universe_name=request.universe_name,
        prompt=request.prompt,
        content_type=request.content_type
    )
    
    return {
        "content": result["content"],
        "universe_name": request.universe_name,
        "prompt": request.prompt,
        "image_url": result.get("image_url")
    }
