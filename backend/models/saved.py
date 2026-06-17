import datetime
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.database import Base

class SavedScholarship(Base):
    __tablename__ = "saved_scholarships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    scholarship_id = Column(UUID(as_uuid=True), ForeignKey("scholarships.id"), nullable=False)
    
    status = Column(String(50), default="Saved") # Saved, Drafting, Submitted, Result Pending, Won, Rejected
    notes = Column(Text)
    
    saved_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", backref="saved_scholarships")
    scholarship = relationship("Scholarship")
