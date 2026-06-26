import sys
import os
from datetime import datetime, timedelta

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.database import SessionLocal
from backend.models.scholarship import Scholarship

def seed():
    db = SessionLocal()
    
    # Check if we already seeded to prevent duplicates
    if db.query(Scholarship).count() > 10:
        print("Database already has enough data.")
        return

    scholarships = [
        {
            "title": "Global Tech Innovators Scholarship",
            "provider": "TechCorp Foundation",
            "amount_min": 10000,
            "amount_max": 50000,
            "currency": "USD",
            "deadline": datetime.utcnow() + timedelta(days=45),
            "renewable": True,
            "degree_levels": ["Bachelors", "Masters"],
            "fields_of_study": ["Computer Science", "Engineering", "Information Technology", "Any Field"],
            "eligible_nationalities": ["Any", "International", "Pakistan", "United States", "India"],
            "eligible_countries": ["United States", "United Kingdom", "Canada"],
            "gpa_requirement": 3.5,
            "description": "A premier scholarship for students pursuing technology and computer science degrees. We are looking for the next generation of innovators.",
            "source_name": "TechCorp",
            "source_url": "https://example.com/techcorp",
            "application_url": "https://example.com/techcorp/apply"
        },
        {
            "title": "Chevening UK Government Scholarships",
            "provider": "UK Government",
            "amount_min": 30000,
            "amount_max": 45000,
            "currency": "GBP",
            "deadline": datetime.utcnow() + timedelta(days=90),
            "renewable": False,
            "degree_levels": ["Masters", "Any Degree"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International", "Developing Countries", "Pakistan", "India"],
            "eligible_countries": ["United Kingdom"],
            "gpa_requirement": 3.0,
            "description": "Chevening is the UK government’s international awards programme aimed at developing global leaders. Fully funded master's degrees.",
            "source_name": "Chevening",
            "source_url": "https://www.chevening.org/",
            "application_url": "https://www.chevening.org/apply"
        },
        {
            "title": "Fulbright Foreign Student Program",
            "provider": "US Department of State",
            "amount_min": 25000,
            "amount_max": 60000,
            "currency": "USD",
            "deadline": datetime.utcnow() + timedelta(days=120),
            "renewable": True,
            "degree_levels": ["Masters", "PhD", "Any Degree"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International", "Pakistan", "India", "Bangladesh"],
            "eligible_countries": ["United States"],
            "gpa_requirement": 3.5,
            "description": "Enables graduate students, young professionals and artists from abroad to study and conduct research in the United States.",
            "source_name": "Fulbright",
            "source_url": "https://foreign.fulbrightonline.org/",
            "application_url": "https://foreign.fulbrightonline.org/apply"
        },
        {
            "title": "Women in Business & Finance Award",
            "provider": "Global Finance Org",
            "amount_min": 5000,
            "amount_max": 15000,
            "currency": "USD",
            "deadline": datetime.utcnow() + timedelta(days=15),
            "renewable": False,
            "degree_levels": ["Bachelors", "Masters", "Any Degree"],
            "fields_of_study": ["Business", "Finance", "Economics", "Any Field"],
            "eligible_nationalities": ["Any", "International"],
            "eligible_countries": ["Any Country", "United Kingdom", "Canada"],
            "gpa_requirement": 3.2,
            "description": "Supporting outstanding women pursuing careers in business, finance, and economics.",
            "source_name": "Global Finance",
            "source_url": "https://example.com/women-finance",
            "application_url": "https://example.com/women-finance/apply"
        },
        {
            "title": "Medical Research Fellowship",
            "provider": "Health Horizons",
            "amount_min": 40000,
            "amount_max": 80000,
            "currency": "USD",
            "deadline": datetime.utcnow() + timedelta(days=60),
            "renewable": True,
            "degree_levels": ["PhD", "Postdoc"],
            "fields_of_study": ["Medicine", "Biology", "Public Health", "Science"],
            "eligible_nationalities": ["Any", "International"],
            "eligible_countries": ["Canada", "Australia", "Any Country"],
            "gpa_requirement": 3.8,
            "description": "Advanced funding for medical researchers looking to make breakthroughs in public health and biology.",
            "source_name": "Health Horizons",
            "source_url": "https://example.com/health",
            "application_url": "https://example.com/health/apply"
        }
    ]

    for s in scholarships:
        db.add(Scholarship(**s, last_scraped_at=datetime.utcnow()))
        
    db.commit()
    print(f"Successfully seeded {len(scholarships)} scholarships into the database.")

if __name__ == '__main__':
    seed()
