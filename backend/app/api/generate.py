from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import json
import logging
from app.core.llm import LLMService
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

class GenerateCharactersRequest(BaseModel):
    universe_name: str

class GeneratedCharacter(BaseModel):
    id: str
    name: str
    universeId: str
    role: str
    description: str
    avatar: str
    color: str

class GenerateCharactersResponse(BaseModel):
    characters: List[GeneratedCharacter]

@router.post("/characters", response_model=GenerateCharactersResponse)
async def generate_characters(request: GenerateCharactersRequest):
    """
    Generate characters for a custom universe using Gemini.
    Uses GEMINI_API_KEY_2 to isolate background data generation from chat workloads.
    """
    prompt = f"""
    You are an expert on pop culture, anime, movies, and literature.
    The user wants to add characters for the universe/fandom: "{request.universe_name}".
    
    Please provide a list of exactly 4 of the most popular/important characters from this universe.
    Return ONLY a raw JSON array of objects. Do not wrap in markdown or backticks.
    
    Each object must have the following keys:
    - "id": A lowercase string with hyphens (e.g. "peter-parker")
    - "name": The character's name
    - "universeId": The lowercase hyphenated name of the universe (e.g. "{request.universe_name.lower().replace(' ', '-')}")
    - "role": A short 2-3 word role (e.g. "Protagonist", "Antagonist", "Support")
    - "description": A 1-2 sentence description of who they are
    - "avatar": A single emoji that best represents the character
    - "color": A hex color code (e.g. "#FF0000") that fits the character's theme
    """
    
    # Force use of a specific key for generation tasks
    dedicated_key = settings.GEMINI_API_KEY_2 or settings.GEMINI_API_KEY
    
    if not dedicated_key:
        raise HTTPException(status_code=500, detail="No Gemini API key available for generation tasks.")
        
    try:
        response_text = await LLMService.generate_response(
            model=settings.CHAT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            api_key=dedicated_key
        )
        
        # Clean up response in case model returns markdown block
        cleaned_response = response_text.replace("```json", "").replace("```", "").strip()
        characters_data = json.loads(cleaned_response)
        
        # Ensure it's a list
        if not isinstance(characters_data, list):
            characters_data = [characters_data]
            
        return {"characters": characters_data}
        
    except Exception as e:
        logger.error(f"Failed to generate characters: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate characters")
