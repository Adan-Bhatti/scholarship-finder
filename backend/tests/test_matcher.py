import pytest
from backend.core.matcher import (
    ScholarshipMatcher, _degrees_match, _nationality_matches, _fields_match
)
from backend.models.profile import Profile
from backend.models.scholarship import Scholarship


# ── Degree synonym tests ───────────────────────────────────────────────────────

class TestDegreeSynonyms:
    def test_masters_matches_masters_apostrophe(self):
        assert _degrees_match("Masters", ["Master's", "PhD"]) is True

    def test_masters_matches_postgraduate(self):
        assert _degrees_match("Masters", ["Postgraduate", "PhD"]) is True

    def test_masters_matches_ms(self):
        assert _degrees_match("Masters", ["MS", "MSc"]) is True

    def test_bachelors_matches_undergraduate(self):
        assert _degrees_match("Bachelors", ["Undergraduate", "Master's"]) is True

    def test_bachelors_matches_apostrophe(self):
        assert _degrees_match("Bachelors", ["Bachelor's"]) is True

    def test_phd_matches_ph_d(self):
        assert _degrees_match("PhD", ["Ph.D.", "Master's"]) is True

    def test_phd_matches_doctorate(self):
        assert _degrees_match("PhD", ["Doctorate", "Doctoral"]) is True

    def test_degree_no_false_positive(self):
        assert _degrees_match("Masters", ["High School", "Undergraduate"]) is False

    def test_any_always_matches(self):
        assert _degrees_match("PhD", ["Any", "All"]) is True

    def test_case_insensitive(self):
        assert _degrees_match("MASTERS", ["master's"]) is True


# ── Nationality normalization tests ────────────────────────────────────────────

class TestNationalityNormalization:
    def test_adjective_vs_country_name(self):
        # Pakistani matches against 'Pakistan' (country name stored in DB)
        assert _nationality_matches("Pakistani", ["Pakistan", "India"]) is True

    def test_adjective_vs_adjective(self):
        assert _nationality_matches("Pakistani", ["Pakistani", "Indian"]) is True

    def test_any_marker_matches_all(self):
        assert _nationality_matches("Pakistani", ["Any"]) is True
        assert _nationality_matches("Pakistani", ["International"]) is True
        assert _nationality_matches("Pakistani", ["Global"]) is True

    def test_no_match(self):
        assert _nationality_matches("Pakistani", ["Indian", "Bangladeshi"]) is False

    def test_american_vs_united_states(self):
        assert _nationality_matches("American", ["United States", "Canada"]) is True

    def test_british_vs_united_kingdom(self):
        assert _nationality_matches("British", ["United Kingdom"]) is True

    def test_empty_nationality_list(self):
        # Empty eligible_nationalities = open to all
        assert _nationality_matches("Pakistani", []) is True

    def test_no_profile_nationality(self):
        # If user hasn't set nationality, don't disqualify
        assert _nationality_matches("", ["Pakistan"]) is True
        assert _nationality_matches(None, ["Pakistan"]) is True


# ── Field of study synonym tests ───────────────────────────────────────────────

class TestFieldSynonyms:
    def test_cs_matches_computer_science(self):
        assert _fields_match("Computer Science", "CS") is True

    def test_cs_matches_software_engineering(self):
        assert _fields_match("Computer Science", "Software Engineering") is True

    def test_cs_matches_it(self):
        assert _fields_match("Computer Science", "Information Technology") is True

    def test_cs_matches_data_science(self):
        assert _fields_match("Data Science", "Computer Science") is True

    def test_engineering_matches_mechanical(self):
        assert _fields_match("Mechanical Engineering", "Engineering") is True

    def test_medicine_matches_public_health(self):
        assert _fields_match("Public Health", "Medicine") is True

    def test_no_false_positive(self):
        assert _fields_match("Law", "Engineering") is False


# ── Full integration tests ─────────────────────────────────────────────────────

class TestMatcherIntegration:
    def test_masters_student_matches_postgraduate_scholarship(self):
        profile = Profile(degree_level="Masters", gpa=3.8)
        scholarship = Scholarship(degree_levels=["Postgraduate", "PhD"], gpa_requirement=3.0)
        matches = ScholarshipMatcher.match_all(profile, [scholarship])
        assert len(matches) == 1

    def test_masters_student_matches_masters_apostrophe(self):
        profile = Profile(degree_level="Masters", gpa=3.8)
        scholarship = Scholarship(degree_levels=["Master's", "PhD"])
        matches = ScholarshipMatcher.match_all(profile, [scholarship])
        assert len(matches) == 1

    def test_bachelors_student_matches_undergraduate(self):
        profile = Profile(degree_level="Bachelors", gpa=3.5)
        scholarship = Scholarship(degree_levels=["Undergraduate"])
        matches = ScholarshipMatcher.match_all(profile, [scholarship])
        assert len(matches) == 1

    def test_pakistani_matches_pakistan_country_name(self):
        """Pakistani adjective must match 'Pakistan' country name stored in DB."""
        profile = Profile(
            degree_level="Masters", gpa=3.5,
            nationality="Pakistani",
            target_destinations=["United Kingdom"]
        )
        scholarship = Scholarship(
            degree_levels=["Master's"],
            eligible_nationalities=["Pakistan", "India"],
            eligible_countries=["United Kingdom"]
        )
        matches = ScholarshipMatcher.match_all(profile, [scholarship])
        assert len(matches) == 1

    def test_american_matches_united_states(self):
        profile = Profile(
            degree_level="Bachelors", gpa=3.5,
            nationality="American",
            country_of_residence="United States"
        )
        scholarship = Scholarship(
            degree_levels=["Undergraduate"],
            eligible_nationalities=["United States"],
            eligible_countries=["United States"]
        )
        matches = ScholarshipMatcher.match_all(profile, [scholarship])
        assert len(matches) == 1

    def test_gpa_disqualification(self):
        profile = Profile(degree_level="Masters", gpa=2.5)
        scholarship = Scholarship(degree_levels=["Master's"], gpa_requirement=3.0)
        matches = ScholarshipMatcher.match_all(profile, [scholarship])
        assert len(matches) == 0

    def test_wrong_nationality_disqualified(self):
        profile = Profile(degree_level="Masters", gpa=3.5, nationality="Pakistani")
        scholarship = Scholarship(
            degree_levels=["Master's"],
            eligible_nationalities=["Indian", "Bangladeshi"]
        )
        matches = ScholarshipMatcher.match_all(profile, [scholarship])
        assert len(matches) == 0

    def test_open_scholarship_base_score(self):
        profile = Profile(degree_level="Masters")
        scholarship = Scholarship()  # No restrictions
        score = ScholarshipMatcher.calculate_score(profile, scholarship)
        assert score == 50.0

    def test_max_sources_filtering(self):
        profile = Profile(degree_level="Undergraduate", gpa=3.8, max_sources=2)
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
