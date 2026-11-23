from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "TASKWEAVER"
    DEBUG: bool = True
    SECRET_KEY: str = "taskweaver-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database — SQLite for dev, PostgreSQL for production
    DATABASE_URL: str = "sqlite+aiosqlite:///./taskweaver.db"

    # Groq AI
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # ML models path
    MODELS_DIR: str = "../deep_learning/saved_models"

    # Risk thresholds (configurable)
    RISK_LOW_THRESHOLD: float = 0.25
    RISK_MODERATE_THRESHOLD: float = 0.50
    RISK_HIGH_THRESHOLD: float = 0.75

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
