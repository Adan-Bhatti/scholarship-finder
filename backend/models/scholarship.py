import datetime
import uuid
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from backend.database import Base

class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    provider = Column(String(500), nullable=False)
    
    amount_min = Column(Float)
    amount_max = Column(Float)
    currency = Column(String(10), default="USD")
    
    deadline = Column(DateTime)
    renewable = Column(Boolean, default=False)
    
    degree_levels = Column(ARRAY(String))
    fields_of_study = Column(ARRAY(String))
    eligible_nationalities = Column(ARRAY(String))
    eligible_countries = Column(ARRAY(String))
    
    gpa_requirement = Column(Float)
    income_requirement = Column(String(255))
    
    description = Column(Text)
    eligibility_text = Column(Text)
    requirements = Column(ARRAY(String))
    benefits = Column(Text)
    
    application_url = Column(Text)
    source_url = Column(Text)
    source_name = Column(String(255))
    
    is_active = Column(Boolean, default=True)
    last_scraped_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
