# Scholarship Finder AI 🎓

An AI-powered full-stack application that scrapes global scholarship databases, structures the data, and uses LLMs to match students with the best opportunities based on their personalized academic and financial profiles.

## ✨ Features
- **Automated Web Scraping:** Uses Scrapy and Playwright to extract data from JS-rendered websites on a scheduled Celery/Redis background task.
- **AI Matching Engine:** Integrates Anthropic Claude API to generate a percentage fit score and personalized eligibility explanations for every scholarship.
- **Smart User Profiles:** Collects deep academic, demographic, and financial criteria via a modern multi-step React onboarding wizard.
- **Full-Text Search & Filters:** Fast PostgreSQL-backed searches with filters for deadlines, amounts, and degree levels.
- **Application Tracker:** Bookmark and track scholarship applications from Saved to Won/Rejected.
- **Modern UI/UX:** Responsive Tailwind CSS interface with glassmorphism design, loading states, and dynamic dashboards.

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.10+, FastAPI, Pydantic, SQLAlchemy |
| **Database** | PostgreSQL, Alembic (Migrations) |
| **Task Queue** | Celery, Redis (Scheduled Scrapers) |
| **Scraping** | Scrapy, Playwright (JS rendering) |
| **AI/LLM** | Anthropic Claude 3 API |

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.10+
- Anthropic API Key (for the matching engine)

### 1. Boot up Infrastructure
Start the PostgreSQL database and Redis broker:
```bash
docker-compose up -d postgres redis
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Create .env file
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scholarships" > .env
echo "REDIS_URL=redis://localhost:6379/0" >> .env
echo "CELERY_BROKER_URL=redis://localhost:6379/0" >> .env
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env

# Run migrations
alembic upgrade head

# Start FastAPI server
uvicorn backend.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Running the Scraper
To run the automated scrapers manually:
```bash
cd backend
celery -A backend.celery_app worker --loglevel=info
```

## 🤝 Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
