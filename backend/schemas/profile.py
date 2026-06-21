import uuid
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator

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

    @field_validator("gpa")
    @classmethod
    def validate_gpa(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            if v < 0.0 or v > 4.0:
                raise ValueError("GPA must be between 0.0 and 4.0.")
        return v

    @field_validator("graduation_year")
    @classmethod
    def validate_graduation_year(cls, v: Optional[int]) -> Optional[int]:
        if v is not None:
            if v < 1900 or v > 2100:
                raise ValueError("Graduation year must be between 1900 and 2100.")
        return v

    @field_validator("max_sources")
    @classmethod
    def validate_max_sources(cls, v: int) -> int:
        if v < 1 or v > 50:
            raise ValueError("Max sources must be between 1 and 50.")
        return v

    @field_validator("nationality", "country_of_residence")
    @classmethod
    def validate_strings(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v.strip():
                raise ValueError("Field cannot be empty or whitespace.")
            return v.strip()
        return v

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    updated_at: datetime
