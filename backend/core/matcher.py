from backend.models.profile import Profile
from backend.models.scholarship import Scholarship
from typing import List, Tuple

# Synonym groups for field-of-study fuzzy matching
FIELD_SYNONYMS = {
    "computer science": ["cs", "computing", "software engineering", "information technology", "it", "programming", "software"],
    "engineering": ["mechanical", "electrical", "civil", "chemical", "aerospace", "biomedical", "industrial"],
    "medicine": ["medical", "health sciences", "nursing", "public health", "pharmacy", "dentistry"],
    "business": ["management", "commerce", "economics", "finance", "accounting", "mba", "entrepreneurship"],
    "law": ["legal", "jurisprudence", "political science", "governance"],
    "arts": ["humanities", "liberal arts", "literature", "philosophy", "history", "languages"],
    "science": ["biology", "chemistry", "physics", "mathematics", "math", "statistics"],
    "social sciences": ["sociology", "psychology", "anthropology", "international relations"],
    "education": ["teaching", "pedagogy", "curriculum"],
    "agriculture": ["agronomy", "food science", "environmental science", "ecology"],
}


def _fields_match(profile_field: str, scholarship_field: str) -> bool:
    """Return True if user's field of study matches scholarship's field using synonyms."""
    pf = profile_field.lower().strip()
    sf = scholarship_field.lower().strip()

    # Direct substring match
    if pf in sf or sf in pf:
        return True

    # Synonym expansion
    for canonical, synonyms in FIELD_SYNONYMS.items():
        all_variants = [canonical] + synonyms
        pf_hit = any(v in pf or pf in v for v in all_variants)
        sf_hit = any(v in sf or sf in v for v in all_variants)
        if pf_hit and sf_hit:
            return True

    return False


class ScholarshipMatcher:
    @staticmethod
    def calculate_score(profile: Profile, scholarship: Scholarship) -> float:
        score = 0.0
        max_possible = 0.0

        # ── Degree Level (Weight: 40) ─────────────────────────────
        if scholarship.degree_levels:
            max_possible += 40
            if profile.degree_level and profile.degree_level in scholarship.degree_levels:
                score += 40

        # ── Field of Study (Weight: 30) — fuzzy matching ──────────
        if scholarship.fields_of_study:
            max_possible += 30
            if profile.field_of_study:
                # "Any" means open to all fields
                if any(f.lower() in ("any", "all fields", "all") for f in scholarship.fields_of_study):
                    score += 30
                else:
                    for field in scholarship.fields_of_study:
                        if _fields_match(profile.field_of_study, field):
                            score += 30
                            break

        # ── Nationality (Weight: 20) ───────────────────────────────
        if scholarship.eligible_nationalities:
            max_possible += 20
            nats_lower = [n.lower() for n in scholarship.eligible_nationalities]
            # Common open-nationality indicators
            if any(n in ("any", "all", "international", "global") for n in nats_lower):
                score += 20
            elif profile.nationality and profile.nationality.lower() in nats_lower:
                score += 20

        # ── Target Destination (Weight: 10) ───────────────────────
        if scholarship.eligible_countries:
            max_possible += 10
            user_countries = [profile.country_of_residence] + (profile.target_destinations or [])
            countries_lower = [c.lower() for c in scholarship.eligible_countries]
            for uc in user_countries:
                if uc and uc.lower() in countries_lower:
                    score += 10
                    break

        if max_possible == 0:
            return 50.0  # Base score for fully open scholarships

        return round((score / max_possible) * 100, 2)

    @classmethod
    def match_all(cls, profile: Profile, scholarships: List[Scholarship]) -> List[Tuple[Scholarship, float]]:
        results = []
        for s in scholarships:
            # Hard disqualification: GPA too low
            if s.gpa_requirement is not None and profile.gpa is not None and profile.gpa < s.gpa_requirement:
                continue

            score = cls.calculate_score(profile, s)
            if score > 20.0:
                results.append((s, score))

        # Sort by score descending
        results.sort(key=lambda x: x[1], reverse=True)
        return results
