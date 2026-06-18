from backend.models.profile import Profile
from backend.models.scholarship import Scholarship
from typing import List, Tuple

class ScholarshipMatcher:
    @staticmethod
    def calculate_score(profile: Profile, scholarship: Scholarship) -> float:
        score = 0.0
        max_possible = 0.0

        # Degree Level (Weight: 40)
        if scholarship.degree_levels:
            max_possible += 40
            if profile.degree_level and profile.degree_level in scholarship.degree_levels:
                score += 40
        
        # Field of Study (Weight: 30)
        if scholarship.fields_of_study:
            max_possible += 30
            if profile.field_of_study:
                # Basic string inclusion check
                for field in scholarship.fields_of_study:
                    if profile.field_of_study.lower() in field.lower() or field.lower() in profile.field_of_study.lower():
                        score += 30
                        break

        # Nationality / Country (Weight: 20)
        if scholarship.eligible_nationalities:
            max_possible += 20
            if profile.nationality and profile.nationality in scholarship.eligible_nationalities:
                score += 20

        # Target Destination / Country of Residence (Weight: 10)
        if scholarship.eligible_countries:
            max_possible += 10
            # Simplify: if the scholarship is in their target destination or current country
            user_countries = [profile.country_of_residence] + (profile.target_destinations or [])
            for uc in user_countries:
                if uc and uc in scholarship.eligible_countries:
                    score += 10
                    break

        if max_possible == 0:
            return 50.0 # Default base score for completely open scholarships
            
        return round((score / max_possible) * 100, 2)

    @classmethod
    def match_all(cls, profile: Profile, scholarships: List[Scholarship]) -> List[Tuple[Scholarship, float]]:
        results = []
        for s in scholarships:
            # Hard disqualifications (e.g. GPA lower than requirement)
            if s.gpa_requirement and profile.gpa and profile.gpa < s.gpa_requirement:
                continue
                
            score = cls.calculate_score(profile, s)
            # Only return matches > 20%
            if score > 20.0:
                results.append((s, score))
                
        # Sort by score descending
        results.sort(key=lambda x: x[1], reverse=True)
        return results
