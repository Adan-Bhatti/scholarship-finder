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

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str

@router.post("/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
def chat_with_ai(
    request: Request,
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found. Please complete onboarding.")
        
    from sqlalchemy import or_
    from backend.database import DATABASE_URL

    # Use SQLite-compatible search (LIKE) — fallback from pg full-text search
    q_terms = body.query.split()
    
    if DATABASE_URL.startswith("sqlite"):
        # SQLite: simple LIKE search
        filters = [
            or_(
                Scholarship.title.ilike(f"%{term}%"),
                Scholarship.description.ilike(f"%{term}%")
            )
            for term in q_terms[:3]
        ]
        scholarships = db.query(Scholarship).filter(
            Scholarship.is_active == True,
            *filters
        ).limit(5).all()
    else:
        # PostgreSQL: full-text search
        from sqlalchemy import func
        ts_vector = func.to_tsvector('english', Scholarship.title + ' ' + func.coalesce(Scholarship.description, ''))
        ts_query = func.plainto_tsquery('english', body.query)
        scholarships = db.query(Scholarship).filter(
            Scholarship.is_active == True,
            or_(
                ts_vector.op('@@')(ts_query),
                Scholarship.title.ilike(f"%{body.query}%")
            )
        ).limit(5).all()

    if not scholarships:
        # Fallback: get top scholarships matching profile degree level
        scholarships = db.query(Scholarship).filter(
            Scholarship.is_active == True
        ).limit(3).all()

    answer = ai_service.chat(body.query, profile, scholarships)
    return ChatResponse(answer=answer)
