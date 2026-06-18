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
    
    # 3. Create dummy scholarships
    if db.query(Scholarship).count() == 0:
        scholarships = [
            Scholarship(
                title="Google Anita Borg Memorial Scholarship",
                provider="Google",
                amount_min=10000.0,
                amount_max=10000.0,
                currency="USD",
                degree_levels=["Undergraduate", "Master's"],
                fields_of_study=["Computer Science", "Software Engineering"],
                gpa_requirement=3.5,
                description="For female undergraduate and graduate students in tech.",
                last_scraped_at=datetime.utcnow()
            ),
            Scholarship(
                title="Engineering Excellence Award",
                provider="Fastweb",
                amount_max=5000.0,
                degree_levels=["Undergraduate"],
                fields_of_study=["Engineering", "Computer Science"],
                gpa_requirement=3.0,
                description="General engineering scholarship open to all undergrads.",
                last_scraped_at=datetime.utcnow()
            ),
            Scholarship(
                title="Local Community Grant",
                provider="Community Foundation",
                amount_max=1000.0,
                degree_levels=["High School"],
                description="For local high school students. (Should not match our undergrad CS user heavily)",
                last_scraped_at=datetime.utcnow()
            )
        ]
        db.add_all(scholarships)
        db.commit()
        print(f"Created {len(scholarships)} dummy scholarships")
    else:
        print("Scholarships already exist in DB")
        
    db.close()

if __name__ == "__main__":
    seed_database()

