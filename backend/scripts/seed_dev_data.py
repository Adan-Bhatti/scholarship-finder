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


SCHOLARSHIPS = [
    # ── Global / International ───────────────────────────────────────────
    {
        "title": "Google Anita Borg Memorial Scholarship",
        "provider": "Google",
        "source_name": "Google",
        "amount_min": 10000.0,
        "amount_max": 10000.0,
        "currency": "USD",
        "degree_levels": ["Undergraduate", "Master's"],
        "fields_of_study": ["Computer Science", "Software Engineering"],
        "eligible_nationalities": ["Any"],
        "eligible_countries": ["United States", "Canada", "United Kingdom"],
        "gpa_requirement": 3.5,
        "description": "For female undergraduate and graduate students in tech.",
        "deadline": datetime.utcnow() + timedelta(days=120),
    },
    {
        "title": "Chevening Scholarship",
        "provider": "UK Government",
        "source_name": "Chevening",
        "amount_min": 15000.0,
        "amount_max": 30000.0,
        "currency": "GBP",
        "degree_levels": ["Master's"],
        "fields_of_study": ["Any"],
        "eligible_nationalities": ["Any"],
        "eligible_countries": ["United Kingdom"],
        "description": "UK Government's global scholarship programme for outstanding future leaders.",
        "deadline": datetime.utcnow() + timedelta(days=90),
    },
    {
        "title": "Fulbright Scholarship Program",
        "provider": "U.S. Department of State",
        "source_name": "Fulbright",
        "amount_min": 20000.0,
        "amount_max": 50000.0,
        "currency": "USD",
        "degree_levels": ["Master's", "PhD"],
        "fields_of_study": ["Any"],
        "eligible_nationalities": ["Any"],
        "eligible_countries": ["United States"],
        "description": "Flagship international exchange program for graduate students and researchers.",
        "deadline": datetime.utcnow() + timedelta(days=200),
    },
    {
        "title": "DAAD Study Scholarship",
        "provider": "DAAD (German Academic Exchange Service)",
        "source_name": "DAAD",
        "amount_min": 12000.0,
        "amount_max": 18000.0,
        "currency": "EUR",
        "degree_levels": ["Master's", "PhD"],
        "fields_of_study": ["Any"],
        "eligible_nationalities": ["Any"],
        "eligible_countries": ["Germany"],
        "description": "Scholarships for international graduates to study in Germany.",
        "deadline": datetime.utcnow() + timedelta(days=150),
    },
    # ── Pakistan-specific ────────────────────────────────────────────────
    {
        "title": "HEC Need-Based Scholarship",
        "provider": "Higher Education Commission Pakistan",
        "source_name": "HEC",
        "amount_min": 500.0,
        "amount_max": 2000.0,
        "currency": "PKR",
        "degree_levels": ["Undergraduate", "Master's"],
        "fields_of_study": ["Any"],
        "eligible_nationalities": ["Pakistani"],
        "eligible_countries": ["Pakistan"],
        "gpa_requirement": 2.5,
        "description": "Financial support for Pakistani students enrolled in HEC-recognized universities.",
        "deadline": datetime.utcnow() + timedelta(days=60),
    },
    {
        "title": "Prime Minister's Laptop Scheme",
        "provider": "Government of Pakistan",
        "source_name": "HEC",
        "degree_levels": ["Undergraduate", "Master's"],
        "fields_of_study": ["Any"],
        "eligible_nationalities": ["Pakistani"],
        "eligible_countries": ["Pakistan"],
        "gpa_requirement": 3.0,
        "description": "Provides laptops to high-achieving Pakistani students at public universities.",
        "deadline": datetime.utcnow() + timedelta(days=30),
    },
    {
        "title": "USAID Pakistan Scholarships",
        "provider": "USAID",
        "source_name": "USAID",
        "amount_min": 5000.0,
        "amount_max": 20000.0,
        "currency": "USD",
        "degree_levels": ["Master's", "PhD"],
        "fields_of_study": ["Agriculture", "Health", "Education", "Engineering"],
        "eligible_nationalities": ["Pakistani"],
        "eligible_countries": ["United States", "Pakistan"],
        "description": "Supports Pakistani students in graduate studies in selected fields.",
        "deadline": datetime.utcnow() + timedelta(days=100),
    },
    # ── India-specific ───────────────────────────────────────────────────
    {
        "title": "National Scholarship Portal (NSP) Award",
        "provider": "Ministry of Education, India",
        "source_name": "NSP India",
        "amount_min": 300.0,
        "amount_max": 1200.0,
        "currency": "INR",
        "degree_levels": ["Undergraduate", "Postgraduate"],
        "fields_of_study": ["Any"],
        "eligible_nationalities": ["Indian"],
        "eligible_countries": ["India"],
        "gpa_requirement": 2.5,
        "description": "Central scholarship for SC/ST/OBC and minority students across India.",
        "deadline": datetime.utcnow() + timedelta(days=90),
    },
    # ── UK-specific ──────────────────────────────────────────────────────
    {
        "title": "Gates Cambridge Scholarship",
        "provider": "Gates Foundation / University of Cambridge",
        "source_name": "Gates Cambridge",
        "amount_min": 18000.0,
        "amount_max": 25000.0,
        "currency": "GBP",
        "degree_levels": ["Master's", "PhD"],
        "fields_of_study": ["Any"],
        "eligible_nationalities": ["Any"],
        "eligible_countries": ["United Kingdom"],
        "gpa_requirement": 3.7,
        "description": "Highly competitive scholarship for outstanding students at University of Cambridge.",
        "deadline": datetime.utcnow() + timedelta(days=110),
    },
    # ── USA-specific ─────────────────────────────────────────────────────
    {
        "title": "Rhodes Scholarship",
        "provider": "Rhodes Trust",
        "source_name": "Rhodes",
        "amount_min": 25000.0,
        "amount_max": 35000.0,
        "currency": "USD",
        "degree_levels": ["Master's", "PhD"],
        "fields_of_study": ["Any"],
        "eligible_nationalities": ["Any"],
        "eligible_countries": ["United Kingdom"],
        "gpa_requirement": 3.7,
        "description": "World's oldest and most prestigious international fellowship for study at Oxford.",
        "deadline": datetime.utcnow() + timedelta(days=180),
    },
    {
        "title": "Fastweb Engineering Excellence Award",
        "provider": "Fastweb",
        "source_name": "Fastweb",
        "amount_max": 5000.0,
        "currency": "USD",
        "degree_levels": ["Undergraduate"],
        "fields_of_study": ["Engineering", "Computer Science"],
        "eligible_nationalities": ["Any"],
        "eligible_countries": ["United States"],
        "gpa_requirement": 3.0,
        "description": "General engineering scholarship open to all US undergrads.",
        "deadline": datetime.utcnow() + timedelta(days=75),
    },
    # ── High school / Community-level ───────────────────────────────────
    {
        "title": "Local Community Grant",
        "provider": "Community Foundation",
        "source_name": "Community Foundation",
        "amount_max": 1000.0,
        "currency": "USD",
        "degree_levels": ["High School"],
        "fields_of_study": ["Any"],
        "eligible_nationalities": ["Any"],
        "eligible_countries": ["United States"],
        "description": "For local high school students preparing for college.",
        "deadline": datetime.utcnow() + timedelta(days=45),
    },
    # ── Australia / NZ ───────────────────────────────────────────────────
    {
        "title": "Australia Awards Scholarship",
        "provider": "Australian Government",
        "source_name": "Australia Awards",
        "amount_min": 20000.0,
        "amount_max": 45000.0,
        "currency": "AUD",
        "degree_levels": ["Undergraduate", "Master's", "PhD"],
        "fields_of_study": ["Any"],
        "eligible_nationalities": ["Any"],
        "eligible_countries": ["Australia"],
        "description": "Full scholarships for students from developing countries to study in Australia.",
        "deadline": datetime.utcnow() + timedelta(days=130),
    },
    # ── Canada ───────────────────────────────────────────────────────────
    {
        "title": "Vanier Canada Graduate Scholarship",
        "provider": "Government of Canada",
        "source_name": "Vanier",
        "amount_min": 50000.0,
        "amount_max": 50000.0,
        "currency": "CAD",
        "degree_levels": ["PhD"],
        "fields_of_study": ["Any"],
        "eligible_nationalities": ["Any"],
        "eligible_countries": ["Canada"],
        "gpa_requirement": 3.7,
        "description": "Prestigious scholarship for doctoral studies in Canadian universities.",
        "deadline": datetime.utcnow() + timedelta(days=160),
    },
    # ── Tech / CS specific ───────────────────────────────────────────────
    {
        "title": "Microsoft Research PhD Fellowship",
        "provider": "Microsoft",
        "source_name": "Microsoft Research",
        "amount_min": 28000.0,
        "amount_max": 42000.0,
        "currency": "USD",
        "degree_levels": ["PhD"],
        "fields_of_study": ["Computer Science", "Electrical Engineering", "Mathematics"],
        "eligible_nationalities": ["Any"],
        "eligible_countries": ["United States", "Canada"],
        "gpa_requirement": 3.5,
        "description": "For second-year PhD students in North America focusing on computing research.",
        "deadline": datetime.utcnow() + timedelta(days=95),
    },
    {
        "title": "Facebook Fellowship Program",
        "provider": "Meta",
        "source_name": "Meta",
        "amount_min": 37000.0,
        "amount_max": 42000.0,
        "currency": "USD",
        "degree_levels": ["PhD"],
        "fields_of_study": ["Computer Science", "Data Science", "AI", "Machine Learning"],
        "eligible_nationalities": ["Any"],
        "eligible_countries": ["United States", "Canada"],
        "gpa_requirement": 3.5,
        "description": "Fellowship for PhD students conducting world-class research in computing.",
        "deadline": datetime.utcnow() + timedelta(days=105),
    },
]


def seed_database():
    print("Starting database seeding...")
    db = SessionLocal()

    # 1. Create a dummy user
    test_email = "test@student.com"
    user = db.query(User).filter(User.email == test_email).first()
    if not user:
        user = User(email=test_email, password_hash=get_password_hash("password123"))
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
            extracurriculars=["Debate Team", "Coding Bootcamp"],
        )
        db.add(profile)
        db.commit()
        print("Created test profile")
    else:
        print("Test profile already exists")

    # 3. Create scholarship records
    existing = db.query(Scholarship).count()
    if existing == 0:
        objs = [Scholarship(last_scraped_at=datetime.utcnow(), **s) for s in SCHOLARSHIPS]
        db.add_all(objs)
        db.commit()
        print(f"Created {len(objs)} scholarships")
    else:
        # Upsert: add missing scholarships by title
        titles = {r.title for r in db.query(Scholarship.title).all()}
        added = 0
        for s in SCHOLARSHIPS:
            if s["title"] not in titles:
                db.add(Scholarship(last_scraped_at=datetime.utcnow(), **s))
                added += 1
        if added:
            db.commit()
            print(f"Added {added} new scholarships")
        else:
            print(f"All {existing} scholarships already present — skipping")

    db.close()


if __name__ == "__main__":
    seed_database()
