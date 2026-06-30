import datetime
import uuid
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from backend.database import Base

class ScraperSource(Base):
    __tablename__ = "scraper_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    url = Column(String(1000), nullable=False, unique=True)
    description = Column(String(1000))
    search_queries = Column(ARRAY(String), default=[])
    
    is_active = Column(Boolean, default=True)
    status = Column(String(50), default="discovered") # discovered, active, failed, paused
    
    last_scraped_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
