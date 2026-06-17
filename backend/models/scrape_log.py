import datetime
import uuid
from sqlalchemy import Column, String, DateTime, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from backend.database import Base

class ScrapeLog(Base):
    __tablename__ = "scrape_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    spider_name = Column(String(255), nullable=False)
    
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    finished_at = Column(DateTime)
    
    records_scraped = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    
    errors = Column(Text)
    status = Column(String(50)) # success | partial | failed
