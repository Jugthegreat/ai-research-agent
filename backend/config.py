from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./research_agent.db"
    
    # Anthropic API
    ANTHROPIC_API_KEY: str = ""
    
    # CORS - Allow all origins in production (you can restrict this later)
    CORS_ORIGINS: list = [
        "http://localhost:3000", 
        "http://localhost:3001",
        "https://*.vercel.app",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Handle Railway's postgres:// vs postgresql:// URL format
        if self.DATABASE_URL and self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql://", 1)

settings = Settings()