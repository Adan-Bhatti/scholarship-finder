import uuid
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.models.profile import Profile
from backend.models.scholarship import Scholarship
from backend.models.saved import SavedScholarship
from backend.schemas.scholarship import MatchResponse, ScholarshipResponse, SavedScholarshipResponse, SavedScholarshipUpdate
from backend.routers.auth import get_current_user
from backend.core.matcher import ScholarshipMatcher
from sqlalchemy import or_
from typing import Optional

router = APIRouter(prefix="/scholarships", tags=["scholarships"])

@router.get("/search", response_model=dict)
def search_scholarships(
    q: Optional[str] = None,
    degree: Optional[str] = None,
    country: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    query = db.query(Scholarship).filter(
        Scholarship.is_active == True,
        (Scholarship.deadline == None) | (Scholarship.deadline > now)
    )
    
    if q:
        search_filter = or_(
            Scholarship.title.ilike(f"%{q}%"),
            Scholarship.provider.ilike(f"%{q}%"),
            Scholarship.description.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)
        
    # Note: SQLite in tests doesn't support array operators like any() easily
    # We will do simple string matching for arrays since it's JSON encoded in SQLite
    # but for postgres it's an ARRAY. We'll use cast to String for cross-compatibility in this simple search.
    from sqlalchemy import cast, String
    
    if degree:
        query = query.filter(cast(Scholarship.degree_levels, String).ilike(f"%{degree}%"))
        
    if country:
        query = query.filter(cast(Scholarship.eligible_countries, String).ilike(f"%{country}%"))
        
    if min_amount is not None:
        query = query.filter(Scholarship.amount_max >= min_amount)
        
    if max_amount is not None:
        query = query.filter(Scholarship.amount_min <= max_amount)
        
    total_count = query.count()
    
    start = (page - 1) * limit
    results = query.order_by(Scholarship.created_at.desc()).offset(start).limit(limit).all()
    
    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "data": [ScholarshipResponse.model_validate(r).model_dump() for r in results]
    }


@router.get("/matches", response_model=List[MatchResponse])
def get_matches(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not created yet. Please complete onboarding.")

    now = datetime.utcnow()
    all_scholarships = db.query(Scholarship).filter(
        Scholarship.is_active == True,
        (Scholarship.deadline == None) | (Scholarship.deadline > now)
    ).all()
    matches = ScholarshipMatcher.match_all(profile, all_scholarships)

    # Paginate results
    start = (page - 1) * limit
    paginated = matches[start: start + limit]

    return [MatchResponse(scholarship=s, match_score=score) for s, score in paginated]

@router.post("/{scholarship_id}/save")
def save_scholarship(scholarship_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scholarship = db.query(Scholarship).filter(Scholarship.id == scholarship_id).first()
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")
        
    existing_save = db.query(SavedScholarship).filter(
        SavedScholarship.user_id == current_user.id,
        SavedScholarship.scholarship_id == scholarship_id
    ).first()
    
    if existing_save:
        raise HTTPException(status_code=400, detail="Scholarship already saved")
        
    new_save = SavedScholarship(
        user_id=current_user.id,
        scholarship_id=scholarship_id,
        status="Saved"
    )
    db.add(new_save)
    db.commit()
    return {"message": "Scholarship saved successfully"}

@router.delete("/{scholarship_id}/unsave")
def unsave_scholarship(scholarship_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.query(SavedScholarship).filter(
        SavedScholarship.user_id == current_user.id,
        SavedScholarship.scholarship_id == scholarship_id
    ).first()
    
    if not saved:
        raise HTTPException(status_code=404, detail="Saved scholarship not found")
        
    db.delete(saved)
    db.commit()
    return {"message": "Scholarship unsaved successfully"}

@router.get("/saved", response_model=List[SavedScholarshipResponse])
def get_saved_scholarships(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.query(SavedScholarship).filter(SavedScholarship.user_id == current_user.id).all()
    return saved

@router.patch("/{scholarship_id}/saved")
def update_saved_scholarship(scholarship_id: uuid.UUID, update_data: SavedScholarshipUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.query(SavedScholarship).filter(
        SavedScholarship.user_id == current_user.id,
        SavedScholarship.scholarship_id == scholarship_id
    ).first()
    
    if not saved:
        raise HTTPException(status_code=404, detail="Saved scholarship not found")
        
    if update_data.status is not None:
        saved.status = update_data.status
    if update_data.notes is not None:
        saved.notes = update_data.notes
        
    db.commit()
    db.refresh(saved)
    return saved
