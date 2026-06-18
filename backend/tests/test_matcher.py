from backend.core.matcher import ScholarshipMatcher
from backend.models.profile import Profile
from backend.models.scholarship import Scholarship

def test_matcher_exact_degree():
    profile = Profile(degree_level="Undergraduate", gpa=3.8)
    scholarship = Scholarship(degree_levels=["Undergraduate", "Master's"], gpa_requirement=3.0)
    
    score = ScholarshipMatcher.calculate_score(profile, scholarship)
    assert score > 0.0

def test_matcher_gpa_disqualification():
    profile = Profile(degree_level="Undergraduate", gpa=2.5)
    scholarship = Scholarship(degree_levels=["Undergraduate"], gpa_requirement=3.0)
    
    matches = ScholarshipMatcher.match_all(profile, [scholarship])
    assert len(matches) == 0

def test_matcher_open_scholarship():
    profile = Profile(degree_level="High School")
    scholarship = Scholarship() # No requirements
    
    score = ScholarshipMatcher.calculate_score(profile, scholarship)
    assert score == 50.0 # Base score
