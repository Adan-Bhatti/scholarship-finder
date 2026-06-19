# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Email notification reminders for expiring scholarships
- OAuth2 social login (Google, GitHub)
- Public shareable scholarship profiles

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
