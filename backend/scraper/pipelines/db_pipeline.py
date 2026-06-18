import os
import sys
from datetime import datetime

# Add project root to path so we can import backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.database import SessionLocal
from backend.models.scholarship import Scholarship

class DatabasePipeline:
    def __init__(self):
        self.db = None

    def open_spider(self, spider):
        self.db = SessionLocal()

    def close_spider(self, spider):
        if self.db:
            self.db.close()

    def process_item(self, item, spider):
        # Check if it already exists in DB
        title = item.get('title')
        provider = item.get('provider')
        
        existing = self.db.query(Scholarship).filter(
            Scholarship.title == title,
            Scholarship.provider == provider
        ).first()
        
        if existing:
            # Update last_scraped_at
            existing.last_scraped_at = datetime.utcnow()
            self.db.commit()
            spider.logger.info(f"Updated existing scholarship: {title}")
        else:
            # Insert new
            new_scholarship = Scholarship(
                title=title,
                provider=provider,
                amount_min=item.get('amount_min'),
                amount_max=item.get('amount_max'),
                currency=item.get('currency'),
                deadline=item.get('deadline'),
                renewable=item.get('renewable', False),
                degree_levels=item.get('degree_levels', []),
                fields_of_study=item.get('fields_of_study', []),
                eligible_nationalities=item.get('eligible_nationalities', []),
                eligible_countries=item.get('eligible_countries', []),
                gpa_requirement=item.get('gpa_requirement'),
                income_requirement=item.get('income_requirement'),
                description=item.get('description'),
                eligibility_text=item.get('eligibility_text'),
                requirements=item.get('requirements', []),
                benefits=item.get('benefits'),
                application_url=item.get('application_url'),
                source_url=item.get('source_url'),
                source_name=item.get('source_name'),
                last_scraped_at=datetime.utcnow()
            )
            self.db.add(new_scholarship)
            self.db.commit()
            spider.logger.info(f"Saved new scholarship: {title}")
            
        return item
