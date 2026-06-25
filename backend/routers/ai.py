import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.routers.auth import get_current_user
from backend.models.user import User
from backend.models.profile import Profile
from backend.models.scholarship import Scholarship
from backend.services.ai_service import ai_service
from backend.core.limiter import limiter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/match", tags=["ai"])

class ExplanationResponse(BaseModel):
    explanation: str
    checklist: List[str]

@router.get("/explain/{scholarship_id}", response_model=ExplanationResponse)
@limiter.limit("5/minute")
def explain_match(
    request: Request,
    scholarship_id: uuid.UUID, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found. Please complete onboarding.")
        
    scholarship = db.query(Scholarship).filter(Scholarship.id == scholarship_id).first()
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found.")
        
    result = ai_service.generate_eligibility_explanation(profile, scholarship)
    
    return ExplanationResponse(
        explanation=result.get("explanation", "No explanation provided."),
        checklist=result.get("checklist", [])
    )
