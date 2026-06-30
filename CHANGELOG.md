# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [2.0.0] - 2026-06-30

### Added
- **Producer-Consumer Source Discovery System** — Background `source_discovery.py` producer uses DuckDuckGo to automatically find new scholarship websites and queue them in the `scraper_sources` database table. A `dynamic_scraper.py` consumer processes the queue using heuristic HTML parsing.
- **`ScraperSource` Model** — New `scraper_sources` table stores discovered sources with status tracking (`pending | active | failed | skipped`) and audit fields.
- **`/sources` Admin API Router** — `GET /sources` and `POST /sources/trigger-discovery` for admin source management.
- **Source Discovery Admin Panel** — New tab in AdminDashboard showing discovered sources and a manual trigger button.
- **10 New Scholarship Scrapers** — Added scrapers for: Opportunities for Africans, AfterSchoolAfrica, ADB, UN Women, Open Society Foundations, Aga Khan Foundation, WUSC, IEFA, EducationsAbroad, Gates Foundation.
- **Retry Logic in HTTP Fetcher** — `_get_with_retry()` with 3 retries and exponential backoff replaces bare `_get()`.
- **Enterprise UI & Dark Mode** — Complete dark mode implementation across all 15+ pages and components. Google Fonts (Inter, Outfit), CSS design tokens, glassmorphism effects, hover glow animations, and a premium look throughout.
- **Alembic migration** — `scraper_sources` table migration.

### Fixed
- **Critical: Email Reminder Crash** — `email_tasks.py` referenced `s.deadline_date` (non-existent field). Fixed to use `s.deadline`. Also improved from "exactly 7 days" to "within 7 days" window.
- **Critical: AI Chat SQLite Crash** — Chat endpoint used PostgreSQL `to_tsvector` which crashes on SQLite. Now uses `LIKE` search with automatic DB dialect detection.
- **Matcher Over-filtering** — Destination country hard-disqualification was too aggressive. Relaxed so that users without `target_destinations` set are never disqualified by `eligible_countries`.
- **Matcher `max_sources` Bug** — Filter that capped results by unique source names removed entirely.
- **Matcher Score Threshold** — Lowered from `> 20` to `>= 0` to surface more valid partial matches.
- **Hardcoded Past Deadlines** — All scrapers that had `datetime(2025, ...)` deadlines updated to dynamic future dates using `timedelta`.
- **Vite App.css Boilerplate** — Replaced the default Vite counter/hero CSS (dead code) with actual app animation utilities.

### Changed
- **AI Provider Documentation** — README, CHANGELOG, .env.example all updated from Anthropic/Claude to Groq/Llama-3 (the actual runtime provider).
- **Scraper Architecture Documentation** — README updated to reflect APScheduler + httpx + BeautifulSoup4 (Celery/Redis/Scrapy/Playwright replaced in v1.4.0 but never documented).
- **`requirements.txt`** — Removed `anthropic==0.109.2` (unused); added `duckduckgo-search>=6.0.0`.
- **Email Tasks** — Removed `@shared_task` Celery decorator; now plain functions called by APScheduler.
- **CI Workflow** — Added `feature/*` branch triggers; added `GROQ_API_KEY` env stub for test environment.

---

## [1.4.0] - 2026-06-25

> **Note:** This release was shipped but not previously documented.

### Added
- **Groq / Llama-3 AI Integration** — Migrated from Anthropic Claude 3 Haiku to Groq `llama-3.3-70b-versatile`. Direct HTTP calls via `httpx` — no Groq SDK required. In-memory response cache for repeated AI requests.
- **AI Chat Endpoint** — `POST /match/chat` — RAG-style chatbot using user profile + top matched scholarships as context.
- **Resume PDF Parser** — `POST /profile/upload-resume` — uploads PDF, extracts academic fields via Groq AI, auto-updates profile.
- **APScheduler Integration** — Replaced Celery + Redis with APScheduler (in-process background jobs). Nightly scraper now runs without any external services.
- **19 New Scholarship Scrapers** — httpx + BeautifulSoup4 scrapers for: Commonwealth, DAAD, Erasmus, Gates Cambridge, Rhodes, Schwarzman, Knight-Hennessy, MEXT, Australia Awards, Mastercard Foundation, Aga Khan, KGSP, Endeavour, Scholars4Dev, HEC Pakistan (3 programs), Chevening, Fulbright, Bold.org, CareerOneStop.
- **Rate Limiting** — SlowAPI-based rate limiting on auth and AI endpoints.
- **Deadline Email Reminders** — Daily background task to alert users of upcoming scholarship deadlines.
- **Password Reset Flow** — `POST /auth/request-reset` and `POST /auth/confirm-reset` with signed JWT tokens.
- **Refresh Token Flow** — `POST /auth/refresh` endpoint for seamless token renewal.
- **Public Profile Sharing** — `GET /profile/public/{id}` — shareable profile URL for social proof.
- **Admin Dashboard** — Frontend admin panel with scraper controls and analytics.
- **Scholarship Explorer** — Debounced search with country, degree, and amount filters.

### Changed
- **Scraper Architecture** — Removed Scrapy, Playwright, and Celery. All scraping now handled by `backend/scraper/http_runner.py`.
- **Task Runner** — Replaced `celery -A backend.celery_app worker` with APScheduler jobs registered in `main.py`.

---

## [1.3.0] - 2026-06-20

### Added
- **Analytics Dashboard** – Real-time stat cards (total matches, saved count, expiring soon, total funding potential) above the main dashboard grid
- **Expanded Scraping Engine** – 5 new Scrapy spiders: Chevening (UK), Fulbright (US), DAAD (Germany), Bold.org, CareerOneStop
- `backend/routers/dashboard.py` – New `/dashboard/stats` endpoint
- `backend/schemas/dashboard.py` – New `DashboardStats` Pydantic schema
- `frontend/src/api/dashboard.ts` – Frontend API wrapper for stats

### Changed
- `backend/scraper/runner.py` – Registered all 5 new spiders to the nightly Celery beat schedule

---

## [1.2.0] - 2026-06-19

### Added
- **Kanban Application Tracker** – Drag-and-drop board on the Saved page with 6 status columns
- `PATCH /scholarships/{id}/saved` – New endpoint to update application status and notes
- `backend/schemas/scholarship.py` – Added `SavedScholarshipResponse` and `SavedScholarshipUpdate` schemas
- `frontend/src/types/index.ts` – Added `ApplicationStatus` union type and `SavedScholarship` interface
- `frontend/src/api/scholarships.ts` – Added `updateSavedStatus()` API wrapper
- `Add/Edit Note` button on saved scholarship cards
- GitHub professional files: issue templates, PR template, CI workflow, Code of Conduct, `.editorconfig`
- `CONTRIBUTING.md`, `LICENSE`, `CODE_OF_CONDUCT.md`

---

## [1.1.0] - 2026-06-18

### Added
- **AI Eligibility Explainer** – `GET /match/explain/{id}` calls Anthropic Claude 3 to generate a personalized eligibility analysis and application checklist
- `backend/services/ai_service.py` – AI service layer with graceful fallback mock response
- `backend/routers/ai.py` – New AI router
- `frontend/src/components/ScholarshipDetail/DetailModal.tsx` – Glassmorphic modal showing AI assessment
- "View Details & AI Explainer" button on all ScholarshipCards
- `ANTHROPIC_API_KEY` config field with graceful degradation

### Fixed
- TypeScript `verbatimModuleSyntax` compilation errors across frontend
- `str` → `string` type errors in `StepExtracurriculars.tsx`

---

## [1.0.0] - 2026-06-17

### Added
- Initial release of the full-stack Scholarship Finder application
- **JWT Authentication** – Secure register/login with bcrypt password hashing
- **Profile Wizard** – 4-step onboarding form (academic, demographic, financial, extracurriculars)
- **Scholarship Matching Engine** – Weighted scoring algorithm in `backend/core/matcher.py`
- **Web Scraping Pipeline** – Scrapy spiders for FastWeb, Scholarships.com, and HEC; with Playwright for JS rendering
- **PostgreSQL Database** – Full ORM models with Alembic migration support
- **Celery + Redis** – Background task queue with nightly beat schedule
- **Global Error Handling** – Standardized API error responses (400, 401, 404, 500)
- `docker-compose.yml` – Full local infrastructure setup
