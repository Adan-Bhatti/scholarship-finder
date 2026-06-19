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
    <img src="https://img.shields.io/badge/AI-Claude%203-orange" alt="Claude">
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
| 🕷️ **Automated Web Scraping** | Scrapy + Playwright spiders crawl 8+ scholarship databases on a nightly Celery beat schedule |
| 🤖 **AI Match Explainer** | Anthropic Claude 3 generates a custom 2-3 sentence fit analysis + 5-step checklist per scholarship |
| 📊 **Analytics Dashboard** | Live stats: total matches, expiring deadlines, and total potential funding |
| 📋 **Kanban Application Tracker** | Drag-and-drop board to move scholarships through `Saved → Drafting → Submitted → Won/Rejected` |
| 🔐 **JWT Authentication** | Secure register/login with hashed passwords and Bearer token auth |
| 🧙 **Onboarding Wizard** | Multi-step profile builder collecting academic, financial, and demographic data |
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
│   └──────────────┘  └─────────────────┘ │
│              SQLAlchemy ORM             │
└──────────────┬───────────────────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
┌──────────┐        ┌──────────┐
│PostgreSQL│        │  Redis   │
│(Data)    │        │(Broker)  │
└──────────┘        └────┬─────┘
                         │
                    ┌────▼──────┐
                    │  Celery   │
                    │  Worker   │
                    │           │
                    │  Scrapy   │
                    │  Spiders  │
                    └───────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Chevening      Fulbright        DAAD
      Bold.org      FastWeb     Scholarships.com
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2 |
| **Database** | PostgreSQL 15, Alembic (schema migrations) |
| **Task Queue** | Celery 5, Redis 7 (broker + result backend) |
| **Web Scraping** | Scrapy, Playwright (JS-rendering) |
| **AI / LLM** | Anthropic Claude 3 (claude-3-haiku) |
| **Auth** | JWT (python-jose), bcrypt |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI |

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — to run PostgreSQL and Redis
- [Node.js 20+](https://nodejs.org/) — for the frontend
- [Python 3.10+](https://www.python.org/)
- An [Anthropic API Key](https://console.anthropic.com/) for the AI Explainer

### 1. Clone the repo
```bash
git clone https://github.com/Adan-Bhatti/scholarship-finder.git
cd scholarship-finder
```

### 2. Start the database and Redis
```bash
docker compose up -d postgres redis
```

### 3. Configure the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy the example environment file and fill in your values
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY and database credentials

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

### 6. (Optional) Run the background scraper worker
```bash
cd backend
celery -A backend.celery_app worker --loglevel=info
# Schedule (runs spiders nightly at midnight UTC):
celery -A backend.celery_app beat --loglevel=info
```

> **Tip:** Use `make dev` to run steps 2–5 together if you have `make` installed. See the [Makefile](Makefile).

---

## 🔑 Environment Variables

Copy [`backend/.env.example`](backend/.env.example) to `backend/.env` and configure the following:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `CELERY_BROKER_URL` | ✅ | Celery broker URL (usually same as Redis) |
| `CELERY_RESULT_BACKEND` | ✅ | Celery result backend URL |
| `SECRET_KEY` | ✅ | Random secret string for JWT signing |
| `ALGORITHM` | ✅ | JWT algorithm, e.g. `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ✅ | Token lifetime in minutes |
| `ANTHROPIC_API_KEY` | ⚠️ | Required for the AI Explainer feature. Without it, a mock response is returned. |

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
│   ├── routers/                 # FastAPI route handlers
│   ├── schemas/                 # Pydantic request/response schemas
│   ├── scraper/                 # Scrapy project
│   │   ├── spiders/             # Individual website spiders
│   │   └── pipelines/           # Dedup and DB pipeline
│   ├── services/                # Business logic (AI service)
│   ├── tasks/                   # Celery task definitions
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
| `GET/PUT` | `/profile/me` | ✅ | Get or update your academic profile |
| `GET` | `/scholarships/matches` | ✅ | Get AI-ranked scholarship matches |
| `GET` | `/match/explain/{id}` | ✅ | Get Claude AI explanation for a scholarship |
| `GET` | `/dashboard/stats` | ✅ | Get your personal dashboard statistics |
| `GET` | `/scholarships/saved` | ✅ | Get your Kanban board items |
| `PATCH` | `/scholarships/{id}/saved` | ✅ | Update status/notes on a saved item |

---

## 🧪 Running Tests

**Backend (pytest):**
```bash
cd backend
source venv/bin/activate
pytest tests/ -v --cov=backend --cov-report=term-missing
```

**Frontend (vitest):**
```bash
cd frontend
npm run test
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
