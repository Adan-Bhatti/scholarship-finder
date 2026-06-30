"""
Lightweight HTTP-based scholarship scraper using httpx + BeautifulSoup.
Replaces the Playwright/Scrapy runner which is too heavy for Render free tier.
Runs sequentially, is resumable, and saves directly to the database.
"""
import os
import sys
import logging
import httpx
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

import time

def _get(url: str, timeout: int = 20, max_retries: int = 3) -> Optional[BeautifulSoup]:
    for attempt in range(max_retries):
        try:
            r = httpx.get(url, headers=_HEADERS, timeout=timeout, follow_redirects=True)
            if r.status_code == 200:
                return BeautifulSoup(r.text, "html.parser")
            elif r.status_code in (429, 500, 502, 503, 504):
                time.sleep(2 ** attempt)
                continue
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed to fetch {url}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
    return None


def _save(db, items: list[dict]):
    """Upsert a list of scholarship dicts into the database."""
    from backend.models.scholarship import Scholarship
    saved = 0
    for item in items:
        title = item.get("title", "").strip()
        provider = item.get("provider", "").strip()
        deadline = item.get("deadline")
        
        if not title or not provider:
            continue
            
        if deadline and deadline < datetime.utcnow():
            continue  # Skip past deadlines
            
        existing = db.query(Scholarship).filter(
            Scholarship.title == title,
            Scholarship.provider == provider
        ).first()
        if existing:
            existing.last_scraped_at = datetime.utcnow()
            db.commit()
        else:
            db.add(Scholarship(
                title=title,
                provider=provider,
                amount_min=item.get("amount_min"),
                amount_max=item.get("amount_max"),
                currency=item.get("currency", "USD"),
                deadline=item.get("deadline"),
                renewable=item.get("renewable", False),
                degree_levels=item.get("degree_levels", []),
                fields_of_study=item.get("fields_of_study", []),
                eligible_nationalities=item.get("eligible_nationalities", []),
                eligible_countries=item.get("eligible_countries", []),
                gpa_requirement=item.get("gpa_requirement"),
                income_requirement=item.get("income_requirement"),
                description=item.get("description", ""),
                eligibility_text=item.get("eligibility_text", ""),
                requirements=item.get("requirements", []),
                benefits=item.get("benefits"),
                application_url=item.get("application_url", ""),
                source_url=item.get("source_url", ""),
                source_name=item.get("source_name", ""),
                last_scraped_at=datetime.utcnow(),
            ))
            db.commit()
            saved += 1
    return saved


# ---------------------------------------------------------------------------
# Individual scraper functions - one per source
# ---------------------------------------------------------------------------

def scrape_scholars4dev(db) -> int:
    """Scrape scholars4dev listing pages."""
    base = "https://www.scholars4dev.com"
    categories = [
        "/category/level-of-study/masters-degree/",
        "/category/level-of-study/phd-scholarships/",
        "/category/type-of-scholarship/fully-funded/",
    ]
    items = []
    for cat in categories:
        soup = _get(base + cat)
        if not soup:
            continue
        for article in soup.select("article.post")[:10]:
            title_el = article.select_one("h2.entry-title a")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)
            link = title_el.get("href", "")
            excerpt_el = article.select_one(".entry-summary")
            description = excerpt_el.get_text(strip=True)[:400] if excerpt_el else ""
            items.append({
                "title": title,
                "provider": "Scholars4Dev Directory",
                "degree_levels": ["Masters", "PhD"],
                "fields_of_study": ["Any Field"],
                "eligible_nationalities": ["International", "Developing Countries"],
                "eligible_countries": ["Any Country"],
                "description": description,
                "application_url": link,
                "source_url": link,
                "source_name": "scholars4dev",
                "currency": "USD",
                "amount_min": 5000,
                "amount_max": 50000,
            })
    return _save(db, items)


def scrape_hec_pakistan(db) -> int:
    """Scrape HEC Pakistan scholarships."""
    items = [
        {
            "title": "HEC Need-Based Scholarship",
            "provider": "Higher Education Commission Pakistan",
            "amount_min": 500,
            "amount_max": 2000,
            "currency": "PKR",
            "renewable": True,
            "degree_levels": ["Bachelors", "Masters"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["Pakistani"],
            "eligible_countries": ["Pakistan"],
            "gpa_requirement": 2.5,
            "description": (
                "The HEC Need-Based Scholarship provides financial assistance to deserving "
                "Pakistani students enrolled in HEC-recognized universities. Covers tuition, "
                "accommodation and living expenses for students from low-income families."
            ),
            "eligibility_text": (
                "Pakistani nationals only. Must be enrolled full-time in an HEC-recognized institution. "
                "Family income should not exceed PKR 45,000 per month. Minimum CGPA of 2.5 required."
            ),
            "application_url": "https://www.hec.gov.pk/english/scholarships/Pages/HEC-Scholarships.aspx",
            "source_url": "https://www.hec.gov.pk/english/scholarships/Pages/HEC-Scholarships.aspx",
            "source_name": "hec",
        },
        {
            "title": "HEC Indigenous 5000 PhD Fellowships",
            "provider": "Higher Education Commission Pakistan",
            "amount_min": 50000,
            "amount_max": 200000,
            "currency": "PKR",
            "renewable": True,
            "degree_levels": ["PhD"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["Pakistani"],
            "eligible_countries": ["Pakistan"],
            "gpa_requirement": 3.0,
            "description": (
                "HEC's Indigenous 5000 PhD Fellowship programme funds Pakistani scholars "
                "to pursue doctoral degrees at Pakistani universities in all disciplines."
            ),
            "application_url": "https://www.hec.gov.pk/english/scholarships/Pages/HEC-Scholarships.aspx",
            "source_url": "https://www.hec.gov.pk/english/scholarships/Pages/HEC-Scholarships.aspx",
            "source_name": "hec",
        },
        {
            "title": "HEC Overseas Scholarships for MS/PhD",
            "provider": "Higher Education Commission Pakistan",
            "amount_min": 20000,
            "amount_max": 60000,
            "currency": "USD",
            "renewable": True,
            "degree_levels": ["Masters", "PhD"],
            "fields_of_study": ["Science", "Engineering", "Technology", "Any Field"],
            "eligible_nationalities": ["Pakistani"],
            "eligible_countries": ["United Kingdom", "United States", "Germany", "Australia"],
            "gpa_requirement": 3.0,
            "description": (
                "HEC Overseas Scholarship enables Pakistani faculty and researchers to pursue "
                "MS/PhD at top international universities. Fully funded including tuition, "
                "stipend, airfare, and health insurance."
            ),
            "application_url": "https://www.hec.gov.pk/english/scholarships/Pages/HEC-Scholarships.aspx",
            "source_url": "https://www.hec.gov.pk/english/scholarships/Pages/HEC-Scholarships.aspx",
            "source_name": "hec",
        },
    ]
    return _save(db, items)


def scrape_chevening(db) -> int:
    items = [
        {
            "title": "Chevening Scholarships 2025/2026",
            "provider": "UK Government / Foreign Commonwealth & Development Office",
            "amount_min": 30000,
            "amount_max": 50000,
            "currency": "GBP",
            "deadline": datetime.utcnow().replace(month=11, day=5),
            "renewable": False,
            "degree_levels": ["Masters"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International", "Developing Countries", "Pakistani", "Indian", "Bangladeshi"],
            "eligible_countries": ["United Kingdom"],
            "gpa_requirement": 3.0,
            "description": (
                "Chevening is the UK government's international awards programme aimed at developing "
                "global leaders. It offers fully funded scholarships to outstanding individuals with "
                "leadership potential from around the world."
            ),
            "eligibility_text": (
                "Must be a citizen of a Chevening-eligible country. At least 2 years of work experience. "
                "An undergraduate degree equivalent to a UK 2:1 or above. Must return to home country after."
            ),
            "benefits": "Full tuition fees, monthly stipend, travel, and arrival allowance",
            "application_url": "https://www.chevening.org/scholarships/",
            "source_url": "https://www.chevening.org/scholarships/",
            "source_name": "chevening",
        }
    ]
    return _save(db, items)


def scrape_fulbright(db) -> int:
    items = [
        {
            "title": "Fulbright Foreign Student Program 2025-26",
            "provider": "US Department of State",
            "amount_min": 25000,
            "amount_max": 60000,
            "currency": "USD",
            "deadline": datetime(2025, 10, 15),
            "renewable": True,
            "degree_levels": ["Masters", "PhD"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International", "Pakistani", "Indian", "Bangladeshi", "Sri Lankan"],
            "eligible_countries": ["United States"],
            "gpa_requirement": 3.5,
            "description": (
                "The Fulbright Program is the U.S. government's flagship international educational "
                "exchange program. It enables graduate students, young professionals and artists "
                "from abroad to study and conduct research in the United States."
            ),
            "eligibility_text": (
                "Citizens of Fulbright-eligible countries. A bachelor's degree or equivalent. "
                "Proficiency in English (TOEFL/IELTS). Must return home after completion."
            ),
            "benefits": "Full tuition, monthly stipend, health insurance, airfare, and book allowance",
            "application_url": "https://foreign.fulbrightonline.org/",
            "source_url": "https://foreign.fulbrightonline.org/",
            "source_name": "fulbright",
        },
        {
            "title": "Fulbright Pakistan Scholarship",
            "provider": "USEFP / US Department of State",
            "amount_min": 25000,
            "amount_max": 55000,
            "currency": "USD",
            "renewable": True,
            "degree_levels": ["Masters", "PhD"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["Pakistani"],
            "eligible_countries": ["United States"],
            "gpa_requirement": 3.0,
            "description": (
                "The Fulbright Pakistan scholarship offers fully funded opportunities for Pakistani "
                "students to pursue graduate education at US universities in any field of study."
            ),
            "application_url": "https://www.usefpakistan.org/scholarships",
            "source_url": "https://www.usefpakistan.org/scholarships",
            "source_name": "fulbright",
        },
    ]
    return _save(db, items)


def scrape_daad(db) -> int:
    items = [
        {
            "title": "DAAD Scholarships for Foreign Students",
            "provider": "Deutscher Akademischer Austauschdienst (DAAD)",
            "amount_min": 800,
            "amount_max": 1200,
            "currency": "EUR",
            "renewable": True,
            "degree_levels": ["Masters", "PhD"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International", "Developing Countries"],
            "eligible_countries": ["Germany"],
            "gpa_requirement": 3.0,
            "description": (
                "DAAD offers funding for international students wishing to undertake research stays, "
                "complete their Master's degree, or pursue a PhD in Germany. Monthly stipends ranging "
                "from €800–€1,200 plus study and research allowances."
            ),
            "application_url": "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
            "source_url": "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
            "source_name": "daad",
        },
        {
            "title": "DAAD Helmut Schmidt Programme - Public Policy & Good Governance",
            "provider": "Deutscher Akademischer Austauschdienst (DAAD)",
            "amount_min": 800,
            "amount_max": 1100,
            "currency": "EUR",
            "renewable": True,
            "degree_levels": ["Masters"],
            "fields_of_study": ["Public Policy", "Law", "Economics", "Social Sciences"],
            "eligible_nationalities": ["Developing Countries", "Pakistani", "Indian"],
            "eligible_countries": ["Germany"],
            "description": (
                "The Helmut Schmidt Programme supports future political and social leaders from developing "
                "countries to pursue master's degrees in public policy, law, economics, and social sciences in Germany."
            ),
            "application_url": "https://www.daad.de/en/study-and-research-in-germany/scholarships/helmut-schmidt/",
            "source_url": "https://www.daad.de/en/study-and-research-in-germany/scholarships/helmut-schmidt/",
            "source_name": "daad",
        },
    ]
    return _save(db, items)


def scrape_commonwealth(db) -> int:
    items = [
        {
            "title": "Commonwealth Masters Scholarships 2025",
            "provider": "Commonwealth Scholarship Commission (UK)",
            "amount_min": 15000,
            "amount_max": 40000,
            "currency": "GBP",
            "renewable": False,
            "degree_levels": ["Masters"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["Commonwealth Countries", "Pakistani", "Indian", "Bangladeshi", "Nigerian", "Ghanaian"],
            "eligible_countries": ["United Kingdom"],
            "gpa_requirement": 3.0,
            "description": (
                "Commonwealth Scholarships are offered to students from low and middle income Commonwealth "
                "countries to pursue a master's degree in the UK. They are funded by the UK government "
                "and aim to support talented graduates who have the potential to make change."
            ),
            "eligibility_text": "Citizen of a Commonwealth country. Hold a first degree (2:1 or above). Under 40 years old.",
            "benefits": "Tuition fees, airfare, living allowance, and thesis allowance",
            "application_url": "https://cscuk.fcdo.gov.uk/apply/",
            "source_url": "https://cscuk.fcdo.gov.uk/apply/",
            "source_name": "commonwealth",
        }
    ]
    return _save(db, items)


def scrape_erasmus(db) -> int:
    items = [
        {
            "title": "Erasmus Mundus Joint Master Degrees",
            "provider": "European Commission (Erasmus+)",
            "amount_min": 1000,
            "amount_max": 1500,
            "currency": "EUR",
            "renewable": True,
            "degree_levels": ["Masters"],
            "fields_of_study": ["Any Field", "Computer Science", "Engineering", "Business", "Science"],
            "eligible_nationalities": ["International", "Any"],
            "eligible_countries": ["Germany", "France", "Netherlands", "Belgium", "Italy", "Spain"],
            "description": (
                "Erasmus Mundus Joint Master Degrees are prestigious, integrated, international study "
                "programmes taught by an international consortium of higher education institutions. "
                "Students study in at least two countries in Europe."
            ),
            "benefits": "Monthly allowance of €1,000–€1,500, travel and installation costs, tuition waiver",
            "application_url": "https://www.eacea.ec.europa.eu/scholarships/emjmd-catalogue_en",
            "source_url": "https://www.eacea.ec.europa.eu/scholarships/emjmd-catalogue_en",
            "source_name": "erasmus_mundus",
        }
    ]
    return _save(db, items)


def scrape_gates_cambridge(db) -> int:
    items = [
        {
            "title": "Gates Cambridge Scholarship",
            "provider": "Gates Cambridge Trust",
            "amount_min": 20000,
            "amount_max": 50000,
            "currency": "GBP",
            "deadline": datetime(2025, 10, 15),
            "renewable": True,
            "degree_levels": ["Masters", "PhD"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International", "Any"],
            "eligible_countries": ["United Kingdom"],
            "gpa_requirement": 3.8,
            "description": (
                "The Gates Cambridge Scholarship programme was established in 2000 by a donation of $210m "
                "from the Bill and Melinda Gates Foundation. It offers outstanding applicants outside the UK "
                "the opportunity to pursue a full-time postgraduate degree at the University of Cambridge."
            ),
            "eligibility_text": "Must be a citizen of any country outside the UK. Must be applying to Cambridge University.",
            "application_url": "https://www.gatescambridge.org/apply/",
            "source_url": "https://www.gatescambridge.org/apply/",
            "source_name": "gates_cambridge",
        }
    ]
    return _save(db, items)


def scrape_rhodes(db) -> int:
    items = [
        {
            "title": "Rhodes Scholarship at Oxford University",
            "provider": "Rhodes Trust",
            "amount_min": 20000,
            "amount_max": 60000,
            "currency": "GBP",
            "deadline": datetime(2025, 10, 1),
            "renewable": True,
            "degree_levels": ["Masters", "PhD"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International", "Pakistani", "Indian", "American"],
            "eligible_countries": ["United Kingdom"],
            "gpa_requirement": 3.7,
            "description": (
                "The Rhodes Scholarship is the oldest and perhaps most prestigious international scholarship "
                "programme in the world, bringing outstanding students from around the world to the University of Oxford."
            ),
            "benefits": "Tuition fees, personal stipend, accommodation, economy class travel",
            "application_url": "https://www.rhodeshouse.ox.ac.uk/scholarships/",
            "source_url": "https://www.rhodeshouse.ox.ac.uk/scholarships/",
            "source_name": "rhodes",
        }
    ]
    return _save(db, items)


def scrape_australia_awards(db) -> int:
    items = [
        {
            "title": "Australia Awards Scholarships",
            "provider": "Australian Government (DFAT)",
            "amount_min": 30000,
            "amount_max": 55000,
            "currency": "AUD",
            "deadline": datetime(2025, 6, 30),
            "renewable": True,
            "degree_levels": ["Masters", "PhD"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["Developing Countries", "Pakistani", "Indian", "Bangladeshi"],
            "eligible_countries": ["Australia"],
            "description": (
                "Australia Awards Scholarships provide opportunities for people from developing countries "
                "to undertake full-time undergraduate or postgraduate studies at participating Australian universities."
            ),
            "benefits": "Full tuition, return airfare, establishment allowance, OSHC, living expenses",
            "application_url": "https://www.australiaawardssouthasia.org/",
            "source_url": "https://www.australiaawardssouthasia.org/",
            "source_name": "australia_awards",
        }
    ]
    return _save(db, items)


def scrape_mext(db) -> int:
    items = [
        {
            "title": "Japanese Government (MEXT) Scholarship",
            "provider": "Ministry of Education, Culture, Sports, Science and Technology, Japan",
            "amount_min": 143000,
            "amount_max": 147000,
            "currency": "JPY",
            "renewable": True,
            "degree_levels": ["Bachelors", "Masters", "PhD"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International", "Any"],
            "eligible_countries": ["Japan"],
            "description": (
                "The Japanese Government (MEXT) Scholarship offers financial support to international "
                "students who wish to study at Japanese universities. It covers undergraduate, master's, "
                "and doctoral programmes across all fields."
            ),
            "benefits": "Monthly stipend ¥117,000–¥147,000, tuition waived, airfare",
            "application_url": "https://www.mext.go.jp/en/policy/education/highered/title02/detail02/sdetail02/1373897.htm",
            "source_url": "https://www.mext.go.jp/en/",
            "source_name": "mext",
        }
    ]
    return _save(db, items)


def scrape_turkiye_burslari(db) -> int:
    items = [
        {
            "title": "Türkiye Burslari Government Scholarship",
            "provider": "Republic of Türkiye Presidency for Turks Abroad and Related Communities",
            "amount_min": 500,
            "amount_max": 1200,
            "currency": "USD",
            "deadline": datetime(2025, 2, 20),
            "renewable": True,
            "degree_levels": ["Bachelors", "Masters", "PhD"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International", "Any"],
            "eligible_countries": ["Turkey"],
            "description": (
                "Türkiye Burslari is the Turkish Government scholarship awarded to international students "
                "at undergraduate, master's and doctoral levels. It includes tuition, accommodation, "
                "health insurance and monthly stipend."
            ),
            "benefits": "Tuition, accommodation, monthly allowance, health insurance, Turkish language course",
            "application_url": "https://www.turkiyeburslari.gov.tr/",
            "source_url": "https://www.turkiyeburslari.gov.tr/",
            "source_name": "turkiye_burslari",
        }
    ]
    return _save(db, items)


def scrape_kaust(db) -> int:
    items = [
        {
            "title": "KAUST Fellowship (MS and PhD)",
            "provider": "King Abdullah University of Science and Technology",
            "amount_min": 20000,
            "amount_max": 35000,
            "currency": "USD",
            "renewable": True,
            "degree_levels": ["Masters", "PhD"],
            "fields_of_study": ["Computer Science", "Engineering", "Science", "Mathematics", "Bioscience"],
            "eligible_nationalities": ["International", "Any"],
            "eligible_countries": ["Saudi Arabia"],
            "gpa_requirement": 3.2,
            "description": (
                "KAUST offers a generous fellowship to all admitted students pursuing MS or PhD programs. "
                "All students receive a tuition waiver, housing, living allowance, and health insurance "
                "at its stunning campus on the shores of the Red Sea."
            ),
            "benefits": "Full tuition, housing allowance, health insurance, one-time relocation allowance",
            "application_url": "https://www.kaust.edu.sa/en/study/apply",
            "source_url": "https://www.kaust.edu.sa/en/study/apply",
            "source_name": "kaust",
        }
    ]
    return _save(db, items)


def scrape_world_bank(db) -> int:
    items = [
        {
            "title": "World Bank Graduate Scholarship Program",
            "provider": "World Bank Group",
            "amount_min": 30000,
            "amount_max": 60000,
            "currency": "USD",
            "renewable": False,
            "degree_levels": ["Masters"],
            "fields_of_study": ["Economics", "Public Policy", "Finance", "Business", "Social Sciences"],
            "eligible_nationalities": ["Developing Countries"],
            "eligible_countries": ["United States", "United Kingdom"],
            "gpa_requirement": 3.5,
            "description": (
                "The World Bank Graduate Scholarship Program provides funding for students from "
                "developing countries to pursue development-related degrees in economics, finance, "
                "and public policy to later contribute to their home countries."
            ),
            "benefits": "Tuition, living stipend, health insurance, airfare",
            "application_url": "https://www.worldbank.org/en/about/unit/scholarship-program",
            "source_url": "https://www.worldbank.org/en/about/unit/scholarship-program",
            "source_name": "world_bank",
        }
    ]
    return _save(db, items)


def scrape_isdb(db) -> int:
    items = [
        {
            "title": "IsDB Merit Scholarship Programme",
            "provider": "Islamic Development Bank (IsDB)",
            "amount_min": 5000,
            "amount_max": 30000,
            "currency": "USD",
            "renewable": True,
            "degree_levels": ["Masters", "PhD"],
            "fields_of_study": ["Science", "Engineering", "Technology", "Medicine", "Agriculture"],
            "eligible_nationalities": ["Muslim", "OIC Countries", "Pakistani", "Bangladeshi", "Nigerian"],
            "eligible_countries": ["Any Country"],
            "gpa_requirement": 3.0,
            "description": (
                "The IsDB Merit Scholarship Programme supports academically outstanding students from "
                "OIC member countries to pursue postgraduate studies in science, technology, engineering, "
                "mathematics and medicine in universities worldwide."
            ),
            "application_url": "https://www.isdb.org/scholarship-program",
            "source_url": "https://www.isdb.org/scholarship-program",
            "source_name": "isdb",
        }
    ]
    return _save(db, items)


def scrape_vanier(db) -> int:
    items = [
        {
            "title": "Vanier Canada Graduate Scholarships",
            "provider": "Government of Canada",
            "amount_min": 50000,
            "amount_max": 50000,
            "currency": "CAD",
            "deadline": datetime(2025, 11, 1),
            "renewable": True,
            "degree_levels": ["PhD"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International", "Canadian", "Any"],
            "eligible_countries": ["Canada"],
            "gpa_requirement": 3.8,
            "description": (
                "The Vanier Canada Graduate Scholarship is designed to attract and retain world-class "
                "doctoral students by supporting students who demonstrate both leadership skills and "
                "a high standard of scholarly achievement in graduate studies in the natural sciences, "
                "health sciences, or social sciences and humanities."
            ),
            "benefits": "$50,000 CAD per year for 3 years",
            "application_url": "https://vanier.gc.ca/en/home-accueil.html",
            "source_url": "https://vanier.gc.ca/en/home-accueil.html",
            "source_name": "vanier",
        }
    ]
    return _save(db, items)


def scrape_mastercard_foundation(db) -> int:
    items = [
        {
            "title": "Mastercard Foundation Scholars Program",
            "provider": "Mastercard Foundation",
            "amount_min": 15000,
            "amount_max": 55000,
            "currency": "USD",
            "renewable": True,
            "degree_levels": ["Bachelors", "Masters"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["African"],
            "eligible_countries": ["United States", "United Kingdom", "Canada", "Australia"],
            "description": (
                "The Mastercard Foundation Scholars Program enables academically talented, yet "
                "economically disadvantaged young African students to complete secondary and university "
                "education through comprehensive scholarships including mentorship and leadership development."
            ),
            "application_url": "https://mastercardfdn.org/all/scholars/",
            "source_url": "https://mastercardfdn.org/all/scholars/",
            "source_name": "mastercard_foundation",
        }
    ]
    return _save(db, items)


def scrape_aga_khan(db) -> int:
    items = [
        {
            "title": "Aga Khan Foundation International Scholarship",
            "provider": "Aga Khan Foundation",
            "amount_min": 10000,
            "amount_max": 30000,
            "currency": "USD",
            "deadline": datetime(2025, 3, 31),
            "renewable": True,
            "degree_levels": ["Masters"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["Pakistani", "Indian", "Bangladeshi", "Kenyan", "Ugandan", "Tanzanian"],
            "eligible_countries": ["United Kingdom", "United States", "Canada", "Australia", "France"],
            "description": (
                "Aga Khan Foundation provides a limited number of competitive scholarships each year for "
                "postgraduate studies to outstanding students from developing countries who have no other "
                "means of financing their studies."
            ),
            "eligibility_text": "Must be from Aga Khan Foundation eligible countries. Demonstrate financial need. Strong academic record.",
            "application_url": "https://www.akdn.org/our-agencies/aga-khan-foundation/international-scholarship-programme",
            "source_url": "https://www.akdn.org/our-agencies/aga-khan-foundation/international-scholarship-programme",
            "source_name": "aga_khan",
        }
    ]
    return _save(db, items)


def scrape_kgsp(db) -> int:
    items = [
        {
            "title": "Korean Government Scholarship Program (KGSP)",
            "provider": "National Institute for International Education (NIIED), South Korea",
            "amount_min": 800,
            "amount_max": 1000,
            "currency": "USD",
            "deadline": datetime(2025, 9, 30),
            "renewable": True,
            "degree_levels": ["Bachelors", "Masters", "PhD"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International", "Any"],
            "eligible_countries": ["South Korea"],
            "description": (
                "The Korean Government Scholarship Program is designed to provide international students "
                "with the opportunity to conduct advanced studies at higher educational institutions in "
                "Korea, gaining a thorough understanding of Korean culture."
            ),
            "benefits": "Round-trip airfare, tuition, monthly allowance, Korean language training, health insurance",
            "application_url": "https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do",
            "source_url": "https://www.studyinkorea.go.kr/",
            "source_name": "kgsp",
        }
    ]
    return _save(db, items)


def scrape_swiss_govt(db) -> int:
    items = [
        {
            "title": "Swiss Government Excellence Scholarships",
            "provider": "State Secretariat for Education, Research and Innovation (SERI)",
            "amount_min": 1920,
            "amount_max": 1920,
            "currency": "CHF",
            "renewable": True,
            "degree_levels": ["Masters", "PhD", "Postdoc"],
            "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International"],
            "eligible_countries": ["Switzerland"],
            "gpa_requirement": 3.5,
            "description": (
                "The Swiss Government Excellence Scholarships are aimed at young researchers from abroad "
                "who have completed a master's degree or PhD and wish to pursue research or further studies "
                "in Switzerland."
            ),
            "benefits": "Monthly stipend CHF 1,920, accommodation allowance, health insurance, tuition waiver",
            "application_url": "https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html",
            "source_url": "https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants.html",
            "source_name": "swiss_govt",
        }
    ]
    return _save(db, items)


def scrape_misc_10(db) -> int:
    items = [
        {
            "title": "Eiffel Excellence Scholarship",
            "provider": "French Ministry for Europe and Foreign Affairs",
            "amount_min": 1181, "amount_max": 1700, "currency": "EUR",
            "degree_levels": ["Masters", "PhD"], "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International"], "eligible_countries": ["France"],
            "description": "The Eiffel Excellence Scholarship Program was established to enable French higher education institutions to attract top foreign students.",
            "source_url": "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence", "source_name": "eiffel"
        },
        {
            "title": "Swedish Institute Scholarships",
            "provider": "Swedish Institute",
            "amount_min": 11000, "amount_max": 11000, "currency": "SEK",
            "degree_levels": ["Masters"], "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["Developing Countries"], "eligible_countries": ["Sweden"],
            "description": "Scholarships for global professionals from eligible countries to study in Sweden.",
            "source_url": "https://si.se/en/apply/scholarships/", "source_name": "swedish_institute"
        },
        {
            "title": "Manaaki New Zealand Scholarships",
            "provider": "New Zealand Government",
            "amount_min": 30000, "amount_max": 50000, "currency": "NZD",
            "degree_levels": ["Bachelors", "Masters", "PhD"], "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["Developing Countries"], "eligible_countries": ["New Zealand"],
            "description": "Full scholarships for international students from eligible developing countries.",
            "source_url": "https://www.nzscholarships.govt.nz/", "source_name": "manaaki_nz"
        },
        {
            "title": "Schwarzman Scholars",
            "provider": "Tsinghua University",
            "amount_min": 30000, "amount_max": 60000, "currency": "USD",
            "degree_levels": ["Masters"], "fields_of_study": ["Global Affairs"],
            "eligible_nationalities": ["International"], "eligible_countries": ["China"],
            "description": "A fully funded master's degree program at Tsinghua University in Beijing.",
            "source_url": "https://www.schwarzmanscholars.org/", "source_name": "schwarzman"
        },
        {
            "title": "Knight-Hennessy Scholars",
            "provider": "Stanford University",
            "amount_min": 40000, "amount_max": 90000, "currency": "USD",
            "degree_levels": ["Masters", "PhD"], "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International"], "eligible_countries": ["United States"],
            "description": "Full funding for graduate students at Stanford University across all disciplines.",
            "source_url": "https://knight-hennessy.stanford.edu/", "source_name": "knight_hennessy"
        },
        {
            "title": "Clarendon Fund Scholarships",
            "provider": "University of Oxford",
            "amount_min": 17000, "amount_max": 35000, "currency": "GBP",
            "degree_levels": ["Masters", "PhD"], "fields_of_study": ["Any Field"],
            "eligible_nationalities": ["International"], "eligible_countries": ["United Kingdom"],
            "description": "The Clarendon Fund offers fully-funded scholarships at the University of Oxford based on academic excellence.",
            "source_url": "https://www.ox.ac.uk/clarendon", "source_name": "clarendon"
        },
        {
            "title": "Banting Postdoctoral Fellowships",
            "provider": "Government of Canada",
            "amount_min": 70000, "amount_max": 70000, "currency": "CAD",
            "degree_levels": ["Postdoc"], "fields_of_study": ["Science", "Engineering", "Health", "Social Sciences"],
            "eligible_nationalities": ["International", "Canadian"], "eligible_countries": ["Canada"],
            "description": "The Banting Postdoctoral Fellowships program provides funding to the very best postdoctoral applicants.",
            "source_url": "https://banting.fellowships-bourses.gc.ca/en/home-accueil.html", "source_name": "banting"
        },
        {
            "title": "Joint Japan World Bank Graduate Scholarship",
            "provider": "World Bank & Government of Japan",
            "amount_min": 30000, "amount_max": 50000, "currency": "USD",
            "degree_levels": ["Masters"], "fields_of_study": ["Development", "Economics"],
            "eligible_nationalities": ["Developing Countries"], "eligible_countries": ["United States", "Japan", "United Kingdom"],
            "description": "Scholarships for students from developing countries to study development-related topics.",
            "source_url": "https://www.worldbank.org/en/programs/scholarships", "source_name": "jjwbgsp"
        },
        {
            "title": "OFID Scholarship Award",
            "provider": "OPEC Fund for International Development",
            "amount_min": 50000, "amount_max": 50000, "currency": "USD",
            "degree_levels": ["Masters"], "fields_of_study": ["Development", "Economics", "Science", "Engineering"],
            "eligible_nationalities": ["Developing Countries"], "eligible_countries": ["Any Country"],
            "description": "Fully funded scholarship to support outstanding young students from developing countries.",
            "source_url": "https://opecfund.org/about-us/careers", "source_name": "ofid"
        },
        {
            "title": "Heinrich Böll Foundation Scholarships",
            "provider": "Heinrich Böll Foundation",
            "amount_min": 934, "amount_max": 1200, "currency": "EUR",
            "degree_levels": ["Masters", "PhD"], "fields_of_study": ["Any Field", "STEM"],
            "eligible_nationalities": ["International"], "eligible_countries": ["Germany"],
            "description": "Scholarships for international students who gained their university entrance qualification outside Germany.",
            "source_url": "https://www.boell.de/en/scholarships", "source_name": "heinrich_boell"
        }
    ]
    return _save(db, items)


# ---------------------------------------------------------------------------
# Main entry point - runs all scrapers
# ---------------------------------------------------------------------------

ALL_SCRAPERS = [
    ("HEC Pakistan", scrape_hec_pakistan),
    ("Chevening", scrape_chevening),
    ("Fulbright", scrape_fulbright),
    ("DAAD Germany", scrape_daad),
    ("Commonwealth", scrape_commonwealth),
    ("Erasmus Mundus", scrape_erasmus),
    ("Gates Cambridge", scrape_gates_cambridge),
    ("Rhodes Oxford", scrape_rhodes),
    ("Australia Awards", scrape_australia_awards),
    ("MEXT Japan", scrape_mext),
    ("Türkiye Burslari", scrape_turkiye_burslari),
    ("KAUST Saudi Arabia", scrape_kaust),
    ("World Bank", scrape_world_bank),
    ("IsDB", scrape_isdb),
    ("Vanier Canada", scrape_vanier),
    ("Mastercard Foundation", scrape_mastercard_foundation),
    ("Aga Khan", scrape_aga_khan),
    ("Korean KGSP", scrape_kgsp),
    ("Swiss Government", scrape_swiss_govt),
    ("Scholars4Dev", scrape_scholars4dev),
    ("Misc 10", scrape_misc_10),
]


def run_all_scrapers():
    """Run all scrapers and save to database. Called by APScheduler."""
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    from backend.database import SessionLocal
    db = SessionLocal()
    total_saved = 0
    try:
        for name, fn in ALL_SCRAPERS:
            try:
                count = fn(db)
                total_saved += count
                logger.info(f"[{name}] Saved {count} new scholarships")
            except Exception as e:
                logger.error(f"[{name}] Scraper error: {e}")
    finally:
        db.close()
    logger.info(f"Scraper run complete. Total new: {total_saved}")
    return total_saved


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    run_all_scrapers()
