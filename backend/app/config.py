from pathlib import Path

from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./luggage_list.db"

    # AI API (OpenAI-compatible)
    AI_API_KEY: str = ""
    AI_BASE_URL: str = "https://api.openai.com/v1"
    AI_MODEL: str = "z-ai/glm-5.1"

    # Weather
    QWEATHER_API_KEY: str = ""
    QWEATHER_BASE_URL: str = "https://devapi.qweather.com"

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = str(PROJECT_ROOT / ".env")


settings = Settings()
