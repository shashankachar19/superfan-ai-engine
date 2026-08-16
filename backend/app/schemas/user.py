from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    fan_level: str = "NEW FAN"
    xp: int = 0
    favorite_universes: List[str] = []
    favorite_characters: List[str] = []
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "id": "60d5ecb8b392d7001f3e3a45",
                "username": "AnimeFan99",
                "email": "fan@example.com",
                "fan_level": "NEW FAN",
                "xp": 0
            }
        }
