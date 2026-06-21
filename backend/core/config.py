from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

# Resolve .env relative to this file so it always loads regardless of cwd
_env_file = Path(__file__).parent.parent / ".env"

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=str(_env_file), case_sensitive=True, extra="ignore")

    PROJECT_NAME: str = "Scholarship Finder"

    # Auth
    SECRET_KEY: str = "supersecretkey_please_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database — defaults to SQLite for development; override with PostgreSQL in production
    DATABASE_URL: str = "sqlite:///./scholarships.db"

    # Celery & Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # AI
    GROQ_API_KEY: str = ""

    # Scraper
    PLAYWRIGHT_HEADLESS: bool = True
    SCRAPER_USER_AGENT: str = "Mozilla/5.0 (compatible; ScholarshipBot/1.0)"

settings = Settings()
