import os
import sys
import logging
from datetime import datetime

# Allow running directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from duckduckgo_search import DDGS
from backend.database import SessionLocal
from backend.models.scraper_source import ScraperSource

logger = logging.getLogger(__name__)

def discover_sources():
    """Producer: Finds new scholarship websites via DuckDuckGo and adds them to DB."""
    queries = [
        "international scholarships for developing countries",
        "fully funded masters scholarships 2026",
        "undergraduate scholarships for international students",
        "phd scholarships fully funded in europe"
    ]
    
    db = SessionLocal()
    total_added = 0
    try:
        with DDGS() as ddgs:
            for query in queries:
                logger.info(f"Searching DuckDuckGo for: {query}")
                results = ddgs.text(query, max_results=10)
                
                if not results:
                    continue

                for r in results:
                    url = r.get("href")
                    title = r.get("title")
                    body = r.get("body")
                    
                    if not url or not title:
                        continue
                        
                    # Skip common social platforms
                    if any(x in url for x in ["facebook.com", "youtube.com", "linkedin.com", "twitter.com", "instagram.com"]):
                        continue
                        
                    existing = db.query(ScraperSource).filter(ScraperSource.url == url).first()
                    if not existing:
                        source = ScraperSource(
                            name=title[:255],
                            url=url[:1000],
                            description=body[:1000] if body else None,
                            search_queries=[query],
                            status="discovered",
                            is_active=True
                        )
                        db.add(source)
                        db.commit()
                        total_added += 1
                        logger.info(f"Discovered new source: {url}")
    except Exception as e:
        logger.error(f"Error discovering sources: {e}")
    finally:
        db.close()
        
    logger.info(f"Source discovery complete. Added {total_added} new sources.")
    return total_added

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    discover_sources()
