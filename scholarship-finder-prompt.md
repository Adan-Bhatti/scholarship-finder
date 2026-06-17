# Scholarship Finder AI — Project Build Prompt

## Project Overview

Build a full-stack **AI-powered Scholarship Finder** that scrapes dozens of scholarship
websites, stores structured data in a database, and matches scholarships to a user's
profile using AI — returning ranked, relevant results with eligibility explanations.

This project demonstrates:
- Advanced web scraping at scale (concurrent, rate-limited, resilient)
- Background job processing (scraper runs on schedule, not per request)
- AI-powered semantic matching beyond simple keyword filtering
- Full-stack engineering with React/TypeScript + FastAPI + PostgreSQL
- A genuinely useful product with real-world impact

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Scraping | Scrapy + Playwright (for JS-rendered pages) |
| Task Queue | Celery + Redis (scheduled scraping jobs) |
| Database | PostgreSQL + SQLAlchemy + Alembic (migrations) |
| AI Matching | Anthropic Claude API or OpenAI API |
| Search | PostgreSQL full-text search (pgvector optional for embeddings) |
| Auth | JWT-based (email + password) |
| Deployment | Frontend → Vercel, Backend + Redis → Render / Railway |
| Testing | Pytest + pytest-asyncio (backend), Vitest (frontend) |

---

## Target Scholarship Sources (Scrape These)

### Tier 1 — High Volume, Structured
| Site | URL | Notes |
|---|---|---|
| Fastweb | fastweb.com/college-scholarships | Largest US database |
| Scholarships.com | scholarships.com | Well-structured listings |
| CareerOneStop | careeronestop.org/toolkit/training/find-scholarships | US Dept of Labor |
| College Board | bigfuture.collegeboard.org/scholarship-search | Authoritative |
| Chegg Scholarships | chegg.com/scholarships | High volume |
| Going Merry | goingmerry.com | Modern, structured |
| Bold.org | bold.org/scholarships | Growing database |
| Scholarship Portal | scholarshipportal.com | International focus |

### Tier 2 — Niche / Regional
| Site | URL | Notes |
|---|---|---|
| HEC Pakistan | hec.gov.pk/scholarships | Pakistan-specific |
| USAID Scholarships | educationusa.state.gov | US govt for internationals |
| Aga Khan Foundation | akdn.org/our-agencies/aga-khan-foundation | South Asia focus |
| Gates Foundation | gatesfoundation.org | High value |
| Fulbright | fulbrightscholars.org | Graduate international |
| DAAD | daad.de/en | Germany-based, international |
| Chevening | chevening.org | UK govt scholarships |
| Commonwealth | cscuk.fcdo.gov.uk | Commonwealth countries |

### Tier 3 — Government / Official Portals
| Site | URL | Notes |
|---|---|---|
| Grants.gov | grants.gov | US federal grants |
| Student Aid (FAFSA) | studentaid.gov | US need-based |
| European Scholarships | scholarshipseurope.com | EU-focused |

> **Scraping note:** Always check `robots.txt` before scraping. For sites that
> block scrapers, use their public RSS feeds, sitemaps, or official APIs where
> available. Use Playwright for JS-rendered pages. Respect rate limits.

---

## Core Features

### 1. User Profile Builder
Collect structured data to power accurate matching:
- **Academic:** Degree level (undergraduate / postgraduate / PhD), field of study,
  GPA / percentage, university name, graduation year
- **Demographic:** Nationality, country of residence, ethnicity (optional),
  gender (optional), disability status (optional)
- **Financial:** Family income bracket, need-based aid required (yes/no)
- **Extracurricular:** Sports, arts, community service, leadership roles
- **Target:** Preferred study destination(s), preferred country of university

### 2. Scholarship Database (Scraped & Structured)
Each scholarship record stores:
```
title, provider, amount, currency, deadline, renewable (bool),
degree_levels[], fields_of_study[], eligible_nationalities[],
eligible_countries[], gpa_requirement, income_requirement,
description, eligibility_text, requirements[], benefits,
application_url, source_url, last_scraped_at
```

### 3. AI Matching Engine
- User profile → AI ranks scholarships by fit (0–100 score)
- AI explains WHY each scholarship matches ("You meet 8 of 9 criteria. Missing: GPA above 3.5")
- Filters: deadline, amount, degree level, country
- Sorts: by match score, deadline (soonest first), amount (highest first)

### 4. Scholarship Detail Page
- Full details: amount, deadline, eligibility, requirements, benefits
- AI-generated "How to Apply" checklist tailored to the user's profile
- One-click "Save" to bookmarks
- Direct link to official application page
- Deadline countdown timer

### 5. Saved Scholarships & Application Tracker
- Bookmark scholarships
- Set application status: `Saved → Drafting → Submitted → Result Pending → Won / Rejected`
- Deadline reminders (in-app badge)

### 6. Dashboard
- Total matching scholarships found
- Scholarships expiring this month
- Top 5 matches with scores
- Total potential funding amount across all matching scholarships
- Recently added scholarships (last 7 days)

### 7. Email Digest (Optional / Bonus)
- Weekly email: "5 new scholarships matching your profile"
- Uses SMTP (Gmail / SendGrid)

---

## Project Structure

```
scholarship-finder/
├── backend/
│   ├── main.py                        # FastAPI entry point
│   ├── routers/
│   │   ├── auth.py                    # Register / login / JWT
│   │   ├── profile.py                 # User profile CRUD
│   │   ├── scholarships.py            # Search, filter, detail
│   │   ├── saved.py                   # Bookmarks + tracker
│   │   └── ai.py                      # Match score + explanation endpoint
│   ├── models/
│   │   ├── user.py
│   │   ├── profile.py
│   │   ├── scholarship.py
│   │   └── saved.py
│   ├── services/
│   │   ├── ai_service.py              # All LLM calls isolated here
│   │   ├── matching_service.py        # Filtering + ranking logic
│   │   └── email_service.py           # Optional digest emails
│   ├── scraper/
│   │   ├── runner.py                  # Celery task: runs all spiders
│   │   ├── base_spider.py             # Shared spider base class
│   │   ├── spiders/
│   │   │   ├── fastweb_spider.py
│   │   │   ├── scholarships_com_spider.py
│   │   │   ├── careeronestop_spider.py
│   │   │   ├── collegeboard_spider.py
│   │   │   ├── bold_spider.py
│   │   │   ├── goingmerry_spider.py
│   │   │   ├── hec_spider.py
│   │   │   ├── chevening_spider.py
│   │   │   ├── fulbright_spider.py
│   │   │   └── daad_spider.py
│   │   ├── parsers/
│   │   │   ├── amount_parser.py       # "$5,000" → 5000 USD
│   │   │   ├── deadline_parser.py     # "March 31, 2026" → date
│   │   │   └── eligibility_parser.py  # Extract structured eligibility
│   │   └── pipelines/
│   │       ├── dedup_pipeline.py      # Deduplicate by title + provider
│   │       └── db_pipeline.py         # Save to PostgreSQL
│   ├── database.py                    # SQLAlchemy + Alembic setup
│   ├── celery_app.py                  # Celery + Redis config
│   ├── requirements.txt
│   └── tests/
│       ├── test_auth.py
│       ├── test_matching.py
│       ├── test_spiders.py            # Spider unit tests with mock HTML
│       └── test_ai.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProfileWizard/         # Multi-step profile form
│   │   │   ├── ScholarshipCard/       # Card with match score badge
│   │   │   ├── ScholarshipDetail/     # Full detail modal/page
│   │   │   ├── FilterSidebar/         # Deadline, amount, country filters
│   │   │   ├── MatchBadge/            # Color-coded score badge
│   │   │   ├── TrackerBoard/          # Kanban for saved scholarships
│   │   │   └── Dashboard/             # Stats + recent + top matches
│   │   ├── pages/
│   │   │   ├── Home.tsx               # Landing page
│   │   │   ├── Onboarding.tsx         # Profile wizard
│   │   │   ├── Results.tsx            # Scholarship list + filters
│   │   │   ├── Detail.tsx             # Single scholarship page
│   │   │   ├── Saved.tsx              # Bookmarks + tracker
│   │   │   └── Login.tsx
│   │   ├── hooks/
│   │   │   ├── useScholarships.ts
│   │   │   ├── useProfile.ts
│   │   │   └── useMatching.ts
│   │   ├── api/                       # Axios API layer
│   │   └── types/                     # TypeScript interfaces
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml                 # PostgreSQL + Redis for local dev
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── .gitignore
```

---

## API Endpoints

```
# Auth
POST   /auth/register
POST   /auth/login
GET    /auth/me

# Profile
GET    /profile                        # Get current user profile
POST   /profile                        # Create profile (onboarding)
PATCH  /profile                        # Update profile

# Scholarships
GET    /scholarships                   # List with filters + pagination
GET    /scholarships/{id}              # Single scholarship detail
GET    /scholarships/search?q=         # Full-text search

# AI Matching
POST   /match                          # Profile → ranked scholarships with scores
GET    /match/explain/{scholarship_id} # Why does this match my profile?

# Saved / Tracker
GET    /saved                          # All saved scholarships
POST   /saved/{scholarship_id}         # Save a scholarship
PATCH  /saved/{scholarship_id}         # Update status / notes
DELETE /saved/{scholarship_id}         # Unsave

# Admin (internal)
POST   /admin/scrape                   # Trigger scrape manually (dev use)
GET    /admin/stats                    # Total scholarships, last scraped, etc.
```

---

## AI Prompt Design (ai_service.py)

### Matching & Scoring System Prompt
```
You are a scholarship advisor with deep expertise in global scholarship programs.

Given a user profile and a list of scholarships, score each scholarship's relevance
to the user from 0–100 and explain the match in one sentence.

Scoring rubric:
- Nationality eligibility match: 30 points
- Degree level match: 20 points
- Field of study match: 20 points
- GPA / academic requirement met: 15 points
- Financial need alignment: 10 points
- Other criteria (gender, disability, extracurricular): 5 points

Respond ONLY in the following JSON format:
[
  {
    "scholarship_id": <string>,
    "score": <integer 0-100>,
    "match_reason": <one sentence explaining why this matches>,
    "missing_criteria": [<string>]
  }
]

Do not include scholarships with a score below 30.
Sort results by score descending.
```

### Eligibility Explainer Prompt
```
You are a scholarship advisor.

Given a user profile and a single scholarship's full details, write a clear, concise
eligibility assessment for this user. Structure your response as:

✅ Criteria you meet: (bullet list)
❌ Criteria you don't meet: (bullet list, or "None" if all met)
⚠️  Criteria that are uncertain: (bullet list, or "None")
📋 Application checklist: (3–5 actionable steps specific to this user)

Keep the tone encouraging and practical. Plain text only, no markdown headers.
```

---

## Scraper Architecture

### Celery Scheduled Jobs
```python
# celery_app.py
from celery.schedules import crontab

CELERYBEAT_SCHEDULE = {
    "scrape-all-daily": {
        "task": "scraper.runner.run_all_spiders",
        "schedule": crontab(hour=2, minute=0),  # 2 AM daily
    },
    "scrape-tier1-hourly": {
        "task": "scraper.runner.run_tier1_spiders",
        "schedule": crontab(minute=0),           # Every hour (high-priority sources)
    },
}
```

### Base Spider Pattern
```python
# scraper/base_spider.py
class BaseScholarshipSpider:
    name: str
    base_url: str
    rate_limit_delay: float = 2.0       # seconds between requests
    max_pages: int = 50
    use_playwright: bool = False         # set True for JS-rendered pages

    async def scrape(self) -> list[ScholarshipRaw]:
        raise NotImplementedError

    def parse(self, html: str) -> ScholarshipRaw:
        raise NotImplementedError

    def normalize(self, raw: ScholarshipRaw) -> Scholarship:
        # Runs amount_parser, deadline_parser, eligibility_parser
        ...
```

### Deduplication Logic
```python
# pipelines/dedup_pipeline.py
# Deduplicate by: normalize(title) + normalize(provider)
# If duplicate found: update existing record (refresh deadline, amount)
# Never create duplicate rows
```

### Resilience Requirements
- Retry failed requests up to 3 times with exponential backoff
- Skip a spider if it fails — do not crash the whole job
- Log all errors to a `scrape_logs` table (spider, error, timestamp)
- Rotate User-Agent strings per request
- Respect `Crawl-delay` in `robots.txt`

---

## Database Schema

```sql
-- users
id, email, password_hash, created_at

-- profiles
id, user_id, degree_level, field_of_study, gpa, nationality,
country_of_residence, gender, disability, income_bracket,
extracurriculars[], target_destinations[], graduation_year, updated_at

-- scholarships
id, title, provider, amount_min, amount_max, currency,
deadline, renewable, degree_levels[], fields_of_study[],
eligible_nationalities[], eligible_countries[],
gpa_requirement, income_requirement, description,
eligibility_text, requirements[], benefits, application_url,
source_url, source_name, is_active, last_scraped_at, created_at

-- saved_scholarships
id, user_id, scholarship_id, status, notes, saved_at, updated_at

-- scrape_logs
id, spider_name, started_at, finished_at, records_scraped,
records_updated, errors, status (success | partial | failed)
```

---

## GitHub Actions CI (ci.yml)

```yaml
name: CI

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: scholarship_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r backend/requirements.txt
      - run: pytest backend/tests/ -v

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: cd frontend && npm install && npm run build && npm run test
```

---

## Docker Compose (Local Dev)

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: scholarships
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## Environment Variables

```env
# backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scholarships
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-jwt-secret-here
AI_PROVIDER=anthropic                   # or openai
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...                   # optional fallback
PLAYWRIGHT_HEADLESS=true
SCRAPER_USER_AGENT=Mozilla/5.0 (compatible; ScholarshipBot/1.0)

# frontend/.env
VITE_API_URL=http://localhost:8000
```

---

## README Must-Haves

- [ ] Live demo link at the very top
- [ ] Screenshot of results page showing match scores
- [ ] GIF of the profile wizard onboarding flow
- [ ] Number of scholarships in the database (keep updated)
- [ ] List of all scraped sources with logos
- [ ] Architecture diagram (scraper → DB → AI → frontend)
- [ ] Quick start with Docker Compose (one command local setup)
- [ ] Environment variables table
- [ ] License + Contributing

---

## Build Order (Recommended)

| Day | Goal |
|---|---|
| 1 | Scaffold: FastAPI hello world, Vite + React setup, Docker Compose (PG + Redis), initial commit |
| 2 | Database models + Alembic migrations + auth (register/login/JWT) |
| 3 | Profile model + profile CRUD endpoints + ProfileWizard frontend (multi-step form) |
| 4 | Write 3 spiders (Fastweb, Scholarships.com, HEC) + dedup pipeline + DB pipeline |
| 5 | Celery + Redis integration, scheduled scraping job, scrape_logs table |
| 6 | Add 5 more spiders (Chevening, Fulbright, DAAD, Bold, CareerOneStop) |
| 7 | AI matching endpoint — profile → ranked scholarships with scores |
| 8 | Frontend: Results page + ScholarshipCard with match badge + FilterSidebar |
| 9 | Frontend: ScholarshipDetail page + AI eligibility explainer |
| 10 | Save / tracker feature (backend + frontend Kanban board) |
| 11 | Dashboard (stats: total matches, expiring soon, top 5, total funding) |
| 12 | Deploy: Render (backend + Redis + Celery), Vercel (frontend), live demo URL |
| 13 | Full README, screenshots/GIF, architecture diagram, tag v1.0.0 release |

---

## What Makes This Stand Out

- **Scale signal:** "Scrapes 15+ scholarship sources on a daily schedule" is a compelling
  line on a resume — it shows you understand background jobs, distributed systems basics,
  and data pipelines.
- **Directly complements `olx-scraper`:** You already have a scraper project — this is
  the upgrade: concurrent, scheduled, with a full product built on top.
- **Real-world impact:** A scholarship finder for Pakistani students (HEC, Aga Khan,
  Chevening, DAAD, Fulbright) is genuinely useful and tells a personal story.
- **AI that earns its place:** The matching engine isn't a chatbot — it's AI doing
  structured reasoning, which is more impressive to technical interviewers.

---

## Interview Talking Points This Project Unlocks

- "I built a scraper that runs on a Celery/Redis schedule, ingests 15+ sources nightly,
  deduplicates records, and surfaces results through an AI matching engine."
- Demonstrates: Scrapy/Playwright, Celery task queues, PostgreSQL, FastAPI, React/TypeScript,
  LLM integration, deployment
- Shows systems thinking: what happens when a scraper fails? (resilience, logging)
- Personally motivated: "I built this because finding scholarships as a Pakistani student
  is painful — everything is scattered across dozens of sites."

---

*Stack consistent with existing repos: Python backend matches `olx-scraper` and
`crypto-analyzer-ai`; React/TypeScript frontend matches `ecom_portfolio` and `researchai`.
New depth added: Celery/Redis, PostgreSQL, Playwright, Alembic migrations.*
