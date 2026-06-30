import os
import sys
import json
import logging
import httpx
from datetime import datetime
from bs4 import BeautifulSoup

# Allow running directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.database import SessionLocal
from backend.models.scraper_source import ScraperSource
from backend.models.scholarship import Scholarship
from backend.core.config import settings

logger = logging.getLogger(__name__)

def extract_scholarship_data(text: str, source_url: str) -> list:
    prompt = f"""
    You are an expert scholarship data extractor. Extract the details of any scholarships found in the following text.
    Return ONLY a JSON array of objects wrapped in a "scholarships" key, like: {{"scholarships": [{{...}}]}}
    Keys for each scholarship:
    - title (string)
    - provider (string)
    - amount_min (number or null)
    - amount_max (number or null)
    - currency (string, usually 'USD')
    - deadline (YYYY-MM-DD or null)
    - degree_levels (array of strings: 'Bachelors', 'Masters', 'PhD', 'Postdoc')
    - fields_of_study (array of strings, e.g. ['Any Field'] or specific)
    - eligible_nationalities (array of strings)
    - eligible_countries (array of strings)
    - gpa_requirement (number or null)
    - description (string)
    - application_url (string, can be the source_url {source_url})
    
    Text:
    {text[:8000]}
    """
    
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        r = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "response_format": {"type": "json_object"}
            },
            timeout=30.0
        )
        if r.status_code == 200:
            content = r.json()["choices"][0]["message"]["content"]
            data = json.loads(content)
            if "scholarships" in data:
                return data["scholarships"]
    except Exception as e:
        logger.error(f"LLM Extraction error: {e}")
    return []

def run_dynamic_scraper():
    db = SessionLocal()
    total_added = 0
    try:
        sources = db.query(ScraperSource).filter(ScraperSource.status == 'discovered').limit(5).all()
        for src in sources:
            logger.info(f"Dynamically scraping {src.url}")
            try:
                r = httpx.get(src.url, timeout=15, follow_redirects=True)
                if r.status_code == 200:
                    soup = BeautifulSoup(r.text, 'html.parser')
                    for script in soup(["script", "style"]):
                        script.decompose()
                    text = soup.get_text(separator=" ", strip=True)
                    
                    items = extract_scholarship_data(text, src.url)
                    
                    for item in items:
                        title = item.get("title", "").strip()
                        provider = item.get("provider", "").strip()
                        if not title or not provider:
                            continue
                            
                        dl = item.get("deadline")
                        parsed_dl = None
                        if dl:
                            try:
                                parsed_dl = datetime.strptime(dl, "%Y-%m-%d")
                            except:
                                pass
                                
                        existing = db.query(Scholarship).filter(Scholarship.title == title).first()
                        if not existing:
                            s = Scholarship(
                                title=title[:500],
                                provider=provider[:500],
                                amount_min=item.get("amount_min"),
                                amount_max=item.get("amount_max"),
                                currency=item.get("currency", "USD")[:10],
                                deadline=parsed_dl,
                                degree_levels=item.get("degree_levels", []),
                                fields_of_study=item.get("fields_of_study", []),
                                eligible_nationalities=item.get("eligible_nationalities", []),
                                eligible_countries=item.get("eligible_countries", []),
                                gpa_requirement=item.get("gpa_requirement"),
                                description=item.get("description", ""),
                                application_url=item.get("application_url", src.url),
                                source_url=src.url,
                                source_name="dynamic_discovery",
                                is_active=True,
                                last_scraped_at=datetime.utcnow()
                            )
                            db.add(s)
                            total_added += 1
                
                src.status = 'active'
                src.last_scraped_at = datetime.utcnow()
                db.commit()
                
            except Exception as e:
                logger.error(f"Failed to scrape {src.url}: {e}")
                src.status = 'failed'
                db.commit()
    finally:
        db.close()
        
    logger.info(f"Dynamic scraping complete. Added {total_added} scholarships.")
    return total_added

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    run_dynamic_scraper()
