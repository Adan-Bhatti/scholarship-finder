from backend.models.profile import Profile
from backend.models.scholarship import Scholarship
from typing import List, Tuple

# ── Degree level synonym map ───────────────────────────────────────────────────
# Maps every known variant to its canonical group so matching is label-agnostic.
DEGREE_GROUPS = [
    {"bachelors", "bachelor's", "bachelor", "undergraduate", "ug", "bs", "ba", "bsc", "b.s.", "b.a."},
    {"masters", "master's", "master", "ms", "msc", "ma", "mba", "postgraduate", "pg",
     "graduate", "m.s.", "m.a.", "m.sc.", "mphil", "m.phil."},
    {"phd", "ph.d.", "doctorate", "doctoral", "doctor of philosophy", "dphil", "d.phil."},
    {"high school", "highschool", "secondary", "hs", "high-school"},
    {"associate", "associate's", "associates", "diploma"},
    {"vocational", "trade", "certificate", "professional"},
]


def _normalize_degree(degree: str) -> str:
    """Return canonical group name for any degree variant."""
    dl = degree.lower().strip()
    for group in DEGREE_GROUPS:
        if dl in group:
            # Return first element as canonical
            return next(iter(group))
    return dl


def _degrees_match(profile_degree: str, scholarship_degrees: List[str]) -> bool:
    """Return True if profile degree belongs to the same group as any scholarship degree."""
    if not profile_degree:
        return False
    pd = _normalize_degree(profile_degree)
    for sd in scholarship_degrees:
        sl = sd.lower().strip()
        if sl in ("any", "all", "other"):
            return True
        if _normalize_degree(sd) == pd:
            return True
    return False


# ── Nationality / country normalization ────────────────────────────────────────
# Maps adjective nationality → country name (and vice versa via reverse lookup).
NATIONALITY_TO_COUNTRY = {
    "afghan": "afghanistan",
    "albanian": "albania",
    "algerian": "algeria",
    "american": "united states",
    "american (us)": "united states",
    "angolan": "angola",
    "argentinian": "argentina",
    "armenian": "armenia",
    "australian": "australia",
    "austrian": "austria",
    "azerbaijani": "azerbaijan",
    "bangladeshi": "bangladesh",
    "belarusian": "belarus",
    "belgian": "belgium",
    "bolivian": "bolivia",
    "bosnian": "bosnia and herzegovina",
    "botswanan": "botswana",
    "brazilian": "brazil",
    "british": "united kingdom",
    "bulgarian": "bulgaria",
    "burmese": "myanmar",
    "cambodian": "cambodia",
    "cameroonian": "cameroon",
    "canadian": "canada",
    "chilean": "chile",
    "chinese": "china",
    "colombian": "colombia",
    "congolese": "democratic republic of the congo",
    "costa rican": "costa rica",
    "croatian": "croatia",
    "cuban": "cuba",
    "czech": "czech republic",
    "danish": "denmark",
    "ecuadorian": "ecuador",
    "egyptian": "egypt",
    "eritrean": "eritrea",
    "estonian": "estonia",
    "ethiopian": "ethiopia",
    "fijian": "fiji",
    "filipino": "philippines",
    "finnish": "finland",
    "french": "france",
    "gambian": "gambia",
    "georgian": "georgia",
    "ghanaian": "ghana",
    "greek": "greece",
    "guatemalan": "guatemala",
    "guinean": "guinea",
    "haitian": "haiti",
    "honduran": "honduras",
    "hungarian": "hungary",
    "icelander": "iceland",
    "indian": "india",
    "indonesian": "indonesia",
    "iranian": "iran",
    "iraqi": "iraq",
    "irish": "ireland",
    "israeli": "israel",
    "italian": "italy",
    "ivorian": "ivory coast",
    "jamaican": "jamaica",
    "japanese": "japan",
    "jordanian": "jordan",
    "kazakh": "kazakhstan",
    "kenyan": "kenya",
    "kyrgyz": "kyrgyzstan",
    "laotian": "laos",
    "latvian": "latvia",
    "lebanese": "lebanon",
    "liberian": "liberia",
    "libyan": "libya",
    "lithuanian": "lithuania",
    "luxembourgish": "luxembourg",
    "macedonian": "north macedonia",
    "malagasy": "madagascar",
    "malawian": "malawi",
    "malaysian": "malaysia",
    "maldivian": "maldives",
    "malian": "mali",
    "maltese": "malta",
    "mauritanian": "mauritania",
    "mauritian": "mauritius",
    "mexican": "mexico",
    "moldovan": "moldova",
    "mongolian": "mongolia",
    "moroccan": "morocco",
    "mozambican": "mozambique",
    "namibian": "namibia",
    "nepalese": "nepal",
    "nepali": "nepal",
    "dutch": "netherlands",
    "new zealander": "new zealand",
    "nicaraguan": "nicaragua",
    "nigerian": "nigeria",
    "nigerien": "niger",
    "norwegian": "norway",
    "omani": "oman",
    "pakistani": "pakistan",
    "panamanian": "panama",
    "paraguayan": "paraguay",
    "peruvian": "peru",
    "polish": "poland",
    "portuguese": "portugal",
    "qatari": "qatar",
    "romanian": "romania",
    "russian": "russia",
    "rwandan": "rwanda",
    "saudi": "saudi arabia",
    "saudi arabian": "saudi arabia",
    "senegalese": "senegal",
    "serbian": "serbia",
    "sierra leonean": "sierra leone",
    "singaporean": "singapore",
    "slovak": "slovakia",
    "slovenian": "slovenia",
    "somali": "somalia",
    "south african": "south africa",
    "south korean": "south korea",
    "korean": "south korea",
    "spanish": "spain",
    "sri lankan": "sri lanka",
    "sudanese": "sudan",
    "swedish": "sweden",
    "swiss": "switzerland",
    "syrian": "syria",
    "taiwanese": "taiwan",
    "tajik": "tajikistan",
    "tanzanian": "tanzania",
    "thai": "thailand",
    "togolese": "togo",
    "trinidadian": "trinidad and tobago",
    "tunisian": "tunisia",
    "turkish": "turkey",
    "turkmen": "turkmenistan",
    "ugandan": "uganda",
    "ukrainian": "ukraine",
    "uruguayan": "uruguay",
    "uzbek": "uzbekistan",
    "venezuelan": "venezuela",
    "vietnamese": "vietnam",
    "yemeni": "yemen",
    "zambian": "zambia",
    "zimbabwean": "zimbabwe",
}

# Reverse map: country name → adjective
COUNTRY_TO_NATIONALITY = {v: k for k, v in NATIONALITY_TO_COUNTRY.items()}


def _nationality_matches(profile_nationality: str, scholarship_nationalities: List[str]) -> bool:
    """
    Return True if the profile's nationality matches the scholarship's eligible_nationalities.
    Handles:
      - Open markers: 'any', 'all', 'international', 'global'
      - Adjective form: 'Pakistani' matched against 'Pakistan'
      - Country form: 'Pakistan' matched against 'Pakistani'
      - Case-insensitive exact match
    """
    if not profile_nationality:
        return True  # No nationality set → don't disqualify
    pl = profile_nationality.lower().strip()

    for n in scholarship_nationalities:
        nl = n.lower().strip()
        if nl in ("any", "all", "international", "global", "worldwide"):
            return True
        if nl == pl:
            return True
        # Adjective → country
        mapped_country = NATIONALITY_TO_COUNTRY.get(pl)
        if mapped_country and mapped_country == nl:
            return True
        # Country → adjective (profile stores country name, scholarship stores adjective)
        mapped_adj = COUNTRY_TO_NATIONALITY.get(pl)
        if mapped_adj and mapped_adj == nl:
            return True
    return False


# ── Field-of-study synonym groups ─────────────────────────────────────────────
FIELD_SYNONYMS = {
    "computer science": ["cs", "computing", "software engineering", "information technology",
                         "it", "programming", "software", "ai", "machine learning",
                         "data science", "cybersecurity", "data engineering"],
    "engineering": ["mechanical", "electrical", "civil", "chemical", "aerospace",
                    "biomedical", "industrial", "systems", "electronics", "robotics",
                    "materials", "manufacturing", "structural"],
    "medicine": ["medical", "health sciences", "nursing", "public health", "pharmacy",
                 "dentistry", "mbbs", "pre-med", "pre-medical", "clinical"],
    "business": ["management", "commerce", "economics", "finance", "accounting",
                 "mba", "entrepreneurship", "marketing", "supply chain", "hr",
                 "operations", "international business"],
    "law": ["legal", "jurisprudence", "political science", "governance", "llb", "llm"],
    "arts": ["humanities", "liberal arts", "literature", "philosophy", "history",
             "languages", "linguistics", "creative writing", "journalism", "media"],
    "science": ["biology", "chemistry", "physics", "mathematics", "math",
                "statistics", "biochemistry", "bioinformatics", "neuroscience",
                "astronomy", "geology", "earth science"],
    "social sciences": ["sociology", "psychology", "anthropology", "international relations",
                        "development studies", "gender studies", "communication"],
    "education": ["teaching", "pedagogy", "curriculum", "edtech", "early childhood"],
    "agriculture": ["agronomy", "food science", "environmental science", "ecology",
                    "forestry", "veterinary", "aquaculture", "horticulture"],
    "architecture": ["urban planning", "urban design", "landscape", "interior design",
                     "construction management"],
    "public policy": ["public administration", "government", "policy", "diplomacy",
                      "international affairs", "nonprofit management"],
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
            if profile.degree_level:
                if _degrees_match(profile.degree_level, scholarship.degree_levels):
                    score += 40

        # ── Field of Study (Weight: 30) — fuzzy matching ──────────
        if scholarship.fields_of_study:
            max_possible += 30
            if profile.field_of_study:
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
            if _nationality_matches(profile.nationality, scholarship.eligible_nationalities):
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
            # ── Hard disqualification: GPA too low ────────────────
            if s.gpa_requirement is not None and profile.gpa is not None:
                if profile.gpa < s.gpa_requirement:
                    continue

            # ── Hard disqualification: Nationality does not match ─
            if s.eligible_nationalities:
                if not _nationality_matches(profile.nationality, s.eligible_nationalities):
                    continue

            # ── Hard disqualification: Destination Countries ───────
            if s.eligible_countries:
                countries_lower = [c.lower().strip() for c in s.eligible_countries]
                if not any(c in ("any", "all", "global", "worldwide", "international")
                           for c in countries_lower):
                    user_countries = []
                    if profile.country_of_residence:
                        user_countries.append(profile.country_of_residence.lower().strip())
                    if profile.target_destinations:
                        user_countries.extend(
                            [d.lower().strip() for d in profile.target_destinations if d]
                        )
                    if user_countries:
                        if not any(uc in countries_lower for uc in user_countries):
                            continue

            # ── Hard disqualification: Degree Level ───────────────
            if s.degree_levels:
                degrees_lower = [d.lower().strip() for d in s.degree_levels]
                if not any(d in ("any", "all", "other") for d in degrees_lower):
                    if profile.degree_level:
                        if not _degrees_match(profile.degree_level, s.degree_levels):
                            continue

            score = cls.calculate_score(profile, s)
            if score > 20.0:
                results.append((s, score))

        # Sort by score descending
        results.sort(key=lambda x: x[1], reverse=True)

        # Filter by max_sources limit (unique sources)
        max_sources = getattr(profile, "max_sources", 5)
        if max_sources is None:
            max_sources = 5

        allowed_sources: set = set()
        filtered_results = []
        for s, score in results:
            source = s.source_name or "Unknown"
            if source in allowed_sources:
                filtered_results.append((s, score))
            elif len(allowed_sources) < max_sources:
                allowed_sources.add(source)
                filtered_results.append((s, score))

        return filtered_results
