import uuid
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ProfileBase(BaseModel):
    degree_level: Optional[str] = None
    field_of_study: Optional[str] = None
    gpa: Optional[float] = None
    nationality: Optional[str] = None
    country_of_residence: Optional[str] = None
    gender: Optional[str] = None
    disability: Optional[str] = None
    income_bracket: Optional[str] = None
    extracurriculars: Optional[List[str]] = []
    target_destinations: Optional[List[str]] = []
    graduation_year: Optional[int] = None
    max_sources: int = 5

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    updated_at: datetime
