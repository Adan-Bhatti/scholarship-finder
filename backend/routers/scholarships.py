import uuid
from typing import List
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

router = APIRouter(prefix="/scholarships", tags=["scholarships"])

@router.get("/matches", response_model=List[MatchResponse])
def get_matches(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not created yet. Please complete onboarding.")
        
    all_scholarships = db.query(Scholarship).all()
    
    matches = ScholarshipMatcher.match_all(profile, all_scholarships)
    
    response = []
    for s, score in matches:
        response.append(MatchResponse(
            scholarship=s,
            match_score=score
        ))
    return response

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
