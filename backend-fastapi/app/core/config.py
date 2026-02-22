from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "BelieveBoy API"
    DEBUG: bool = True
    
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 300
    
    DATABASE_URL: str = "sqlite:///./data/database.db"
    
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8800"]
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
