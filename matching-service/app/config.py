from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017/skillforge_matching"
    model_name: str = "all-MiniLM-L6-v2"
    port: int = 8000

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
