.PHONY: help dev backend frontend db worker lint test clean

## ─────────────────────────────────────────
## Scholarship Finder AI — Developer Makefile
## Run `make help` to see all commands
## ─────────────────────────────────────────

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ──────────────── Infrastructure ────────────────
db: ## Start PostgreSQL and Redis via Docker Compose
	docker compose up -d postgres redis
	@echo "✅ Database and Redis are up"

db-down: ## Stop all Docker services
	docker compose down

db-reset: ## Reset database (warning: deletes all data)
	docker compose down -v
	docker compose up -d postgres redis

# ──────────────── Backend ────────────────
install-backend: ## Install Python dependencies
	cd backend && pip install -r requirements.txt

migrate: ## Run Alembic database migrations
	cd backend && alembic upgrade head

migrate-new: ## Create a new Alembic migration (usage: make migrate-new msg="add column")
	cd backend && alembic revision --autogenerate -m "$(msg)"

backend: ## Start FastAPI backend server (with hot reload)
	cd backend && uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

worker: ## Start Celery worker
	cd backend && celery -A backend.celery_app worker --loglevel=info

beat: ## Start Celery beat scheduler (nightly scraper jobs)
	cd backend && celery -A backend.celery_app beat --loglevel=info

# ──────────────── Frontend ────────────────
install-frontend: ## Install Node.js dependencies
	cd frontend && npm install

frontend: ## Start Vite dev server
	cd frontend && npm run dev

build: ## Build the frontend for production
	cd frontend && npm run build

# ──────────────── Testing ────────────────
test: ## Run all backend tests with coverage
	cd backend && pytest tests/ -v --cov=backend --cov-report=term-missing

test-frontend: ## Run frontend tests
	cd frontend && npm run test

# ──────────────── Linting ────────────────
lint: ## Run all linters (ruff + eslint)
	cd backend && ruff check .
	cd frontend && npm run lint

format: ## Auto-format all code (ruff + prettier)
	cd backend && ruff format .
	cd frontend && npx prettier --write src/

# ──────────────── Dev Shortcut ────────────────
dev: db ## Start the full dev stack (DB + backend + frontend)
	@echo "Starting backend and frontend in parallel..."
	@make -j2 backend frontend

# ──────────────── Cleanup ────────────────
clean: ## Remove all build artifacts and caches
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/dist
	@echo "✅ Cleaned up build artifacts"
