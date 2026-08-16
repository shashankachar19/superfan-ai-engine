from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "SuperFan AI"
    
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "superfan_ai"
    
    # LLM Models Configuration
    CHAT_MODEL: str = "gemini/gemini-1.5-flash"
    CONTENT_MODEL: str = "gemini/gemini-1.5-flash"
    STORY_MODEL: str = "gemini/gemini-1.5-flash"
    MEMORY_MODEL: str = "gemini/gemini-1.5-flash"
    RECOMMENDATION_MODEL: str = "gemini/gemini-1.5-flash"
    
    # API Keys (litellm supports using standard env vars, but we add them here for documentation)
    GEMINI_API_KEY: str = ""
    GEMINI_API_KEY_1: str = "" 
    GEMINI_API_KEY_2: str = ""
    GEMINI_API_KEY_3: str = ""
    GEMINI_API_KEY_4: str = ""
    GEMINI_API_KEY_5: str = ""
    GEMINI_API_KEY_6: str = ""
    GEMINI_API_KEY_7: str = ""
    GEMINI_API_KEY_8: str = ""
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    
    # Auth
    JWT_SECRET: str = "super-secret-key-change-in-production"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
