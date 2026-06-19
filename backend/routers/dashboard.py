from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models.user import User
from backend.models.profile import Profile
from backend.models.scholarship import Scholarship
from backend.models.saved import SavedScholarship
from backend.routers.auth import get_current_user
from backend.schemas.dashboard import DashboardStats
from backend.core.matcher import ScholarshipMatcher

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    all_scholarships = db.query(Scholarship).all()
    
    # 1. Total Matches & Funding Potential
    total_matches = 0
    total_funding = 0.0
    expiring_soon = 0
    now = datetime.utcnow()
    thirty_days_from_now = now + timedelta(days=30)
    
    if profile:
        matches = ScholarshipMatcher.match_all(profile, all_scholarships)
        total_matches = len(matches)
        
        for s, score in matches:
            if s.amount_max:
                total_funding += s.amount_max
            
            if s.deadline and now <= s.deadline <= thirty_days_from_now:
                expiring_soon += 1
                
    # 2. Saved Count
    saved_count = db.query(func.count(SavedScholarship.id)).filter(SavedScholarship.user_id == current_user.id).scalar() or 0
    
    return DashboardStats(
        total_matches=total_matches,
        saved_count=saved_count,
        expiring_soon_count=expiring_soon,
        total_funding_potential=total_funding
    )
