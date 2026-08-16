from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class CharacterResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    role: str
    universe: str
    greeting: str
    responses: Dict[str, str]
    defaultResponse: str
    color: str
    emoji: str
    level: str
    
    class Config:
        populate_by_name = True

class UniverseResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    category: str
    tagline: str
    description: str
    accent: str
    accentSecondary: str
    accentGlow: str
    episodes: Optional[str] = None
    icon: str
    characters: List[str]
    gradient: str
    
    class Config:
        populate_by_name = True
