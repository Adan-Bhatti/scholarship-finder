<div align="center">
  <h1>🎓 Scholarship Finder AI</h1>
  <p><strong>An AI-powered platform that scrapes global scholarship databases, matches students using LLMs, and tracks applications end-to-end.</strong></p>

  <p>
    <a href="https://github.com/Adan-Bhatti/scholarship-finder/actions/workflows/ci.yml">
      <img src="https://github.com/Adan-Bhatti/scholarship-finder/actions/workflows/ci.yml/badge.svg" alt="CI Status">
    </a>
    <a href="https://github.com/Adan-Bhatti/scholarship-finder/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT">
    </a>
    <img src="https://img.shields.io/badge/python-3.10%2B-blue" alt="Python">
    <img src="https://img.shields.io/badge/react-19-61DAFB?logo=react" alt="React">
    <img src="https://img.shields.io/badge/fastapi-0.115-009688?logo=fastapi" alt="FastAPI">
    <img src="https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/AI-Groq%20%2F%20Llama--3-orange" alt="Groq">
  </p>
</div>

---

## 📖 Table of Contents
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Running Tests](#-running-tests)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🕷️ **Automated Web Scraping** | 29+ scholarship scrapers run on a nightly APScheduler schedule using httpx + BeautifulSoup |
| 🔍 **Producer-Consumer Discovery** | Background producer discovers new scholarship websites via DuckDuckGo; consumer scrapes and indexes them automatically |
| 🤖 **AI Match Explainer** | Groq Llama-3 generates a custom 2-3 sentence fit analysis + 5-step checklist per scholarship |
| 💬 **AI Chat Assistant** | RAG-powered chatbot answers scholarship questions using your profile as context |
| 🔍 **Scholarship Explorer** | Real-time debounced search to filter by country, degree, keyword, and amount |
| 📊 **Analytics Dashboard** | Live stats: total matches, expiring deadlines, and total potential funding |
| 📋 **Kanban Application Tracker** | Drag-and-drop board to move scholarships through `Saved → Drafting → Submitted → Won/Rejected` |
| 🔐 **JWT Authentication** | Secure register/login with hashed passwords, refresh tokens, and Bearer auth |
| 🧙 **Onboarding Wizard** | Multi-step profile builder collecting academic, financial, and demographic data |
| 📄 **Resume Parser** | Upload your PDF resume — AI extracts your degree, GPA, and field automatically |
| 🐳 **Docker Ready** | One-command `docker-compose up` spins up the full stack |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│              React Frontend              │
│   (Vite + TypeScript + Tailwind CSS)     │
└──────────────┬───────────────────────────┘
               │ REST API (Axios)
               ▼
┌──────────────────────────────────────────┐
│           FastAPI Backend                │
│   ┌──────────────┐  ┌─────────────────┐ │
│   │  Auth Router │  │  Match Router   │ │
│   ├──────────────┤  ├─────────────────┤ │
│   │  AI Router   │  │Dashboard Router │ │
│   ├──────────────┤  ├─────────────────┤ │
│   │Sources Router│  │ Scraper Router  │ │
│   └──────────────┘  └─────────────────┘ │
│              SQLAlchemy ORM             │
└──────────────┬───────────────────────────┘
               │
    ┌──────────┴──────────────────┐
    ▼                             ▼
┌──────────┐           ┌─────────────────────┐
│PostgreSQL│           │   APScheduler       │
│(Data)    │           │  Background Jobs    │
└──────────┘           └──────────┬──────────┘
                                  │
              ┌───────────────────┼──────────────────┐
              ▼                   ▼                  ▼
     ┌─────────────┐    ┌──────────────┐   ┌───────────────┐
     │  Scraper    │    │  Producer    │   │   Consumer    │
     │ (29+ sites) │    │  Discovery   │   │  Dynamic      │
     │ httpx+BS4   │    │ DuckDuckGo   │   │  Scraper      │
     └─────────────┘    └──────────────┘   └───────────────┘
              │                   │
     ┌────────┴────────┐          │ scraper_sources table
     ▼         ▼       ▼          ▼
 Chevening  Fulbright  DAAD   [New Sources]
 Erasmus    Gates      MEXT   [Auto-discovered]
 HEC        KGSP      +22 more
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Framer Motion |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2 |
| **Database** | PostgreSQL 15 (prod) / SQLite (dev), Alembic (schema migrations) |
| **Scheduler** | APScheduler (background jobs — scraper, reminders, discovery) |
| **Web Scraping** | httpx + BeautifulSoup4 (lightweight, no Playwright required) |
| **AI / LLM** | Groq API (llama-3.3-70b-versatile) |
| **Auth** | JWT (python-jose), bcrypt |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI |

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — to run PostgreSQL
- [Node.js 20+](https://nodejs.org/) — for the frontend
- [Python 3.10+](https://www.python.org/)
- A free [Groq API Key](https://console.groq.com/keys) for the AI Explainer & Chat

### 1. Clone the repo
```bash
git clone https://github.com/Adan-Bhatti/scholarship-finder.git
cd scholarship-finder
```

### 2. Start the database
```bash
docker compose up -d postgres
```

### 3. Configure the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy the example environment file and fill in your values
cp .env.example .env
# Edit .env — add your GROQ_API_KEY and database credentials

# Apply database migrations
alembic upgrade head

# (Optional) Seed with sample data
python scripts/seed_dev_data.py
```

### 4. Start the backend server
```bash
uvicorn backend.main:app --reload
# API is now available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### 5. Start the frontend
```bash
cd ../frontend
npm install
npm run dev
# App is now available at http://localhost:5173
```

### 6. (Optional) Trigger the scraper manually
The scraper runs automatically every 24h via APScheduler once the backend starts.
You can also trigger it from the Admin panel → "Run Scraper Now", or via:
```bash
cd backend
python -m backend.scraper.http_runner
```

> **Tip:** Use `make dev` to run steps 2–5 together if you have `make` installed. See the [Makefile](Makefile).

---

## 🔑 Environment Variables

Copy [`backend/.env.example`](backend/.env.example) to `backend/.env` and configure the following:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (or `sqlite:///./scholarships.db` for local dev) |
| `SECRET_KEY` | ✅ | Random secret string for JWT signing |
| `ALGORITHM` | ✅ | JWT algorithm, e.g. `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ✅ | Token lifetime in minutes |
| `GROQ_API_KEY` | ⚠️ | Required for AI Explainer & Chat. Free key at [console.groq.com](https://console.groq.com/keys) |
| `DUCKDUCKGO_MAX_RESULTS` | Optional | Max results per discovery query (default: 10) |

---

## 📁 Project Structure

```
scholarship-finder/
├── .github/
│   ├── workflows/ci.yml         # GitHub Actions CI pipeline
│   ├── ISSUE_TEMPLATE/          # Bug & feature request templates
│   └── PULL_REQUEST_TEMPLATE.md
├── backend/
│   ├── alembic/                 # Database migration scripts
│   ├── core/                    # Config, exceptions, matching engine
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── scholarship.py       # Scholarship data model
│   │   ├── profile.py           # User profile model
│   │   ├── saved.py             # Saved scholarships model
│   │   └── scraper_source.py    # Discovered sources queue model
│   ├── routers/                 # FastAPI route handlers
│   │   └── sources.py           # Source discovery admin API
│   ├── schemas/                 # Pydantic request/response schemas
│   ├── scraper/                 # Scraping engine
│   │   ├── http_runner.py       # 29+ scholarship scrapers (httpx + BS4)
│   │   ├── source_discovery.py  # Producer: DuckDuckGo source finder
│   │   └── dynamic_scraper.py   # Consumer: generic site scraper
│   ├── services/                # Business logic (AI service)
│   ├── tasks/                   # Background task definitions
│   ├── tests/                   # Pytest test suite
│   ├── .env.example             # Environment variable template
│   ├── Dockerfile
│   ├── main.py                  # FastAPI app entrypoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios API wrappers
│   │   ├── components/          # Reusable UI components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page-level components
│   │   ├── types/               # TypeScript type definitions
│   │   └── utils/               # Helper utilities
│   └── package.json
├── docker-compose.yml
├── Makefile
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── README.md
```

---

## 📡 API Reference

The API is fully documented via Swagger UI. Run the backend and visit `http://localhost:8000/docs`.

**Key Endpoints:**

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register a new user |
| `POST` | `/auth/login` | ❌ | Login and get a JWT token |
| `POST` | `/auth/refresh` | ❌ | Refresh access token |
| `GET/PATCH` | `/profile` | ✅ | Get or update your academic profile |
| `POST` | `/profile/upload-resume` | ✅ | Upload PDF resume for AI parsing |
| `GET` | `/scholarships/matches` | ✅ | Get AI-ranked scholarship matches |
| `GET` | `/scholarships/search` | ✅ | Full-text search with filters |
| `POST` | `/scholarships/{id}/save` | ✅ | Save a scholarship to tracker |
| `GET` | `/match/explain/{id}` | ✅ | Get Groq AI explanation for a scholarship |
| `POST` | `/match/chat` | ✅ | Chat with AI scholarship advisor |
| `GET` | `/dashboard/stats` | ✅ | Get your personal dashboard statistics |
| `GET` | `/sources` | ✅ | List auto-discovered scholarship sources |
| `POST` | `/sources/discover` | ✅ | Manually run the source discovery producer |
| `POST` | `/sources/scrape` | ✅ | Manually trigger the dynamic AI scraper |
| `POST` | `/scraper/run` | ✅ | Manually trigger the static scholarship scraper |

---

## 🧪 Running Tests

**Backend (pytest):**
```bash
cd backend
source venv/bin/activate
pytest tests/ -v --tb=short
```

**Frontend (TypeScript type-check):**
```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for our full guidelines. In short:

1. Fork the repo and create your branch: `git checkout -b feature/my-awesome-feature`
2. Commit your changes: `git commit -m 'feat: Add my awesome feature'`
3. Push to the branch: `git push origin feature/my-awesome-feature`
4. Open a Pull Request

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 🔒 Security

If you discover a security vulnerability, please see our [SECURITY.md](SECURITY.md) for responsible disclosure guidelines. **Do not open a public GitHub issue.**

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/Adan-Bhatti">Adan Bhatti</a></p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
