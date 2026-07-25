# backend/core/config.py

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OPENROUTER_API_KEY: str
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    LLM_MODEL: str = "mistralai/mistral-7b-instruct"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()