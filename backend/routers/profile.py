import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import PyPDF2
from io import BytesIO

from backend.database import get_db
from backend.models.user import User
from backend.models.profile import Profile
from backend.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from backend.routers.auth import get_current_user
from backend.services.ai_service import ai_service

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("", response_model=ProfileResponse)
def create_profile(profile_in: ProfileCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        raise HTTPException(status_code=400, detail="Profile already exists for this user")
    
    new_profile = Profile(
        user_id=current_user.id,
        **profile_in.model_dump()
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@router.patch("", response_model=ProfileResponse)
def update_profile(profile_in: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/public/{profile_id}", response_model=ProfileResponse)
def get_public_profile(profile_id: uuid.UUID, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found or is private")
    return profile

@router.post("/upload-resume", response_model=ProfileResponse)
async def upload_resume(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Please complete basic onboarding before uploading a resume.")
        
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    content = await file.read()
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to parse PDF.")
        
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from the PDF.")
        
    # Extract data using Groq
    parsed_data = ai_service.parse_resume(text)
    
    # Update profile fields if found
    if parsed_data.get("degree_level"):
        profile.degree_level = parsed_data["degree_level"]
    if parsed_data.get("field_of_study"):
        profile.field_of_study = parsed_data["field_of_study"]
    if parsed_data.get("gpa") is not None:
        profile.gpa = float(parsed_data["gpa"])
    if parsed_data.get("graduation_year") is not None:
        profile.graduation_year = int(parsed_data["graduation_year"])
    
    if parsed_data.get("extracurriculars"):
        existing_ecs = profile.extracurriculars or []
        # Merge and deduplicate
        profile.extracurriculars = list(set(existing_ecs + parsed_data["extracurriculars"]))
        
    if parsed_data.get("target_destinations"):
        existing_td = profile.target_destinations or []
        profile.target_destinations = list(set(existing_td + parsed_data["target_destinations"]))
        
    db.commit()
    db.refresh(profile)
    return profile
