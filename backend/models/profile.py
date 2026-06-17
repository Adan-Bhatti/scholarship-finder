import datetime
import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from backend.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    degree_level = Column(String(100))
    field_of_study = Column(String(255))
    gpa = Column(Float)
    nationality = Column(String(100))
    country_of_residence = Column(String(100))
    gender = Column(String(50))
    disability = Column(String(255))
    income_bracket = Column(String(100))
    
    extracurriculars = Column(ARRAY(String))
    target_destinations = Column(ARRAY(String))
    graduation_year = Column(Integer)
    
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", backref="profile")
