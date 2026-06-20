from typing import List, Optional
from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict

class ScholarshipBase(BaseModel):
    title: str
    provider: str
    amount_min: Optional[float] = None
    amount_max: Optional[float] = None
    currency: Optional[str] = "USD"
    deadline: Optional[datetime] = None
    renewable: Optional[bool] = False
    degree_levels: Optional[List[str]] = []
    fields_of_study: Optional[List[str]] = []
    eligible_nationalities: Optional[List[str]] = []
    eligible_countries: Optional[List[str]] = []
    gpa_requirement: Optional[float] = None
    income_requirement: Optional[str] = None
    description: Optional[str] = None
    eligibility_text: Optional[str] = None
    requirements: Optional[List[str]] = []
    benefits: Optional[str] = None
    application_url: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None

class ScholarshipResponse(ScholarshipBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    last_scraped_at: Optional[datetime] = None

class MatchResponse(BaseModel):
    scholarship: ScholarshipResponse
    match_score: float

class SavedScholarshipUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class SavedScholarshipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    scholarship: ScholarshipResponse
    status: str
    notes: Optional[str] = None
    saved_at: datetime
    updated_at: datetime
