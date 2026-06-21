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


def test_matcher_nationality_disqualification():
    # Restricted nationality, mismatch
    profile = Profile(degree_level="Undergraduate", gpa=3.5, nationality="Pakistan")
    scholarship = Scholarship(eligible_nationalities=["USA", "Canada"])
    matches = ScholarshipMatcher.match_all(profile, [scholarship])
    assert len(matches) == 0

    # Restricted nationality, matches
    profile_match = Profile(degree_level="Undergraduate", gpa=3.5, nationality="USA")
    matches = ScholarshipMatcher.match_all(profile_match, [scholarship])
    assert len(matches) == 1

    # Open nationality indicator (e.g. international) - should match
    scholarship_open = Scholarship(eligible_nationalities=["International"])
    matches = ScholarshipMatcher.match_all(profile, [scholarship_open])
    assert len(matches) == 1


def test_matcher_destination_country_disqualification():
    # Restricted destination countries, mismatch
    profile = Profile(degree_level="Undergraduate", gpa=3.5, country_of_residence="Pakistan", target_destinations=["Canada"])
    scholarship = Scholarship(eligible_countries=["UK", "Germany"])
    matches = ScholarshipMatcher.match_all(profile, [scholarship])
    assert len(matches) == 0

    # Match by residence
    profile_res = Profile(degree_level="Undergraduate", gpa=3.5, country_of_residence="UK", target_destinations=["Canada"])
    matches = ScholarshipMatcher.match_all(profile_res, [scholarship])
    assert len(matches) == 1

    # Match by target destination
    profile_dest = Profile(degree_level="Undergraduate", gpa=3.5, country_of_residence="Pakistan", target_destinations=["Germany"])
    matches = ScholarshipMatcher.match_all(profile_dest, [scholarship])
    assert len(matches) == 1


def test_matcher_degree_level_disqualification():
    # Mismatch degree level
    profile = Profile(degree_level="Undergraduate", gpa=3.5)
    scholarship = Scholarship(degree_levels=["Postgraduate", "PhD"])
    matches = ScholarshipMatcher.match_all(profile, [scholarship])
    assert len(matches) == 0

    # Matches degree level
    profile_ok = Profile(degree_level="PhD", gpa=3.5)
    matches = ScholarshipMatcher.match_all(profile_ok, [scholarship])
    assert len(matches) == 1


def test_matcher_max_sources_filtering():
    # Setup profile with max_sources = 2
    profile = Profile(degree_level="Undergraduate", gpa=3.8, max_sources=2)
    
    # 4 scholarships from 3 different sources
    s1 = Scholarship(degree_levels=["Undergraduate"], source_name="Source A")
    s2 = Scholarship(degree_levels=["Undergraduate"], source_name="Source B")
    s3 = Scholarship(degree_levels=["Undergraduate"], source_name="Source C")
    s4 = Scholarship(degree_levels=["Undergraduate"], source_name="Source A")
    
    matches = ScholarshipMatcher.match_all(profile, [s1, s2, s3, s4])
    matched_scholarships = [m[0] for m in matches]
    
    assert s1 in matched_scholarships
    assert s2 in matched_scholarships
    assert s4 in matched_scholarships
    assert s3 not in matched_scholarships


