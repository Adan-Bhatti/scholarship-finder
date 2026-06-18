import os
import sys
from datetime import datetime, timedelta

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.database import SessionLocal, engine, Base
from backend.models.user import User
from backend.models.profile import Profile
from backend.models.scholarship import Scholarship
from backend.core.security import get_password_hash

def seed_database():
    print("Starting database seeding...")
    db = SessionLocal()
    
    # 1. Create a dummy user
    test_email = "test@student.com"
    user = db.query(User).filter(User.email == test_email).first()
    if not user:
        user = User(email=test_email, hashed_password=get_password_hash("password123"))
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created test user: {test_email} / password123")
    else:
        print(f"Test user already exists: {test_email}")

    # 2. Create a dummy profile
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(
            user_id=user.id,
            degree_level="Undergraduate",
            field_of_study="Computer Science",
            gpa=3.8,
            nationality="American",
            country_of_residence="United States",
            target_destinations=["United Kingdom", "Canada"],
            extracurriculars=["Debate Team", "Coding Bootcamp"]
        )
        db.add(profile)
        db.commit()
        print("Created test profile")
    else:
        print("Test profile already exists")
    
    db.close()

if __name__ == "__main__":
    seed_database()
