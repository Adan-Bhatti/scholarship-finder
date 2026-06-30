from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.scraper_source import ScraperSource
from backend.scraper.source_discovery import discover_sources
from backend.scraper.dynamic_scraper import run_dynamic_scraper

router = APIRouter(prefix="/sources", tags=["sources"])

@router.get("/")
def get_sources(db: Session = Depends(get_db)):
    sources = db.query(ScraperSource).order_by(ScraperSource.created_at.desc()).limit(50).all()
    return {"sources": sources}

@router.post("/discover")
def trigger_discovery(background_tasks: BackgroundTasks):
    """Trigger DuckDuckGo source discovery in background."""
    background_tasks.add_task(discover_sources)
    return {"message": "Source discovery started in background."}

@router.post("/scrape")
def trigger_dynamic_scraper(background_tasks: BackgroundTasks):
    """Trigger dynamic AI scraper in background."""
    background_tasks.add_task(run_dynamic_scraper)
    return {"message": "Dynamic scraping started in background."}
