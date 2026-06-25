param(
    [Parameter(Position=0)]
    [string]$Command = "help",

    [Parameter(Position=1)]
    [string]$Msg = "new migration"
)

function Show-Help {
    Write-Host "-----------------------------------------" -ForegroundColor Cyan
    Write-Host " Scholarship Finder AI - Developer Script" -ForegroundColor Cyan
    Write-Host " Run '.\make.ps1 help' to see all commands" -ForegroundColor Cyan
    Write-Host "-----------------------------------------" -ForegroundColor Cyan
    Write-Host ""
    
    $commands = @{
        "help"             = "Show this help message"
        "db"               = "Start PostgreSQL and Redis via Docker Compose"
        "db-down"          = "Stop all Docker services"
        "db-reset"         = "Reset database (warning: deletes all data)"
        "install-backend"  = "Install Python dependencies"
        "migrate"          = "Run Alembic database migrations"
        "migrate-new"      = "Create a new Alembic migration (usage: .\make.ps1 migrate-new 'add column')"
        "backend"          = "Start FastAPI backend server (with hot reload)"
        "worker"           = "Start Celery worker"
        "beat"             = "Start Celery beat scheduler (nightly scraper jobs)"
        "install-frontend" = "Install Node.js dependencies"
        "frontend"         = "Start Vite dev server"
        "build"            = "Build the frontend for production"
        "test"             = "Run all backend tests with coverage"
        "test-frontend"    = "Run frontend tests"
        "lint"             = "Run all linters (ruff + eslint)"
        "format"           = "Auto-format all code (ruff + prettier)"
        "dev"              = "Start the full dev stack (DB + backend + frontend)"
        "clean"            = "Remove all build artifacts and caches"
    }

    $commands.GetEnumerator() | Sort-Object Name | ForEach-Object {
        Write-Host "  $($_.Name.PadRight(20)) " -ForegroundColor Cyan -NoNewline
        Write-Host $_.Value
    }
}

switch ($Command) {
    "help" {
        Show-Help
    }
    "db" {
        docker compose up -d postgres redis
        Write-Host "[OK] Database and Redis are up" -ForegroundColor Green
    }
    "db-down" {
        docker compose down
    }
    "db-reset" {
        docker compose down -v
        docker compose up -d postgres redis
    }
    "install-backend" {
        Push-Location backend
        pip install -r requirements.txt
        Pop-Location
    }
    "migrate" {
        Push-Location backend
        alembic upgrade head
        Pop-Location
    }
    "migrate-new" {
        Push-Location backend
        alembic revision --autogenerate -m "$Msg"
        Pop-Location
    }
    "backend" {
        Push-Location backend
        $env:PYTHONPATH = ".."
        uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
        Pop-Location
    }
    "worker" {
        Push-Location backend
        $env:PYTHONPATH = ".."
        celery -A backend.celery_app worker --loglevel=info
        Pop-Location
    }
    "beat" {
        Push-Location backend
        $env:PYTHONPATH = ".."
        celery -A backend.celery_app beat --loglevel=info
        Pop-Location
    }
    "install-frontend" {
        Push-Location frontend
        npm install
        Pop-Location
    }
    "frontend" {
        Push-Location frontend
        npm run dev
        Pop-Location
    }
    "build" {
        Push-Location frontend
        npm run build
        Pop-Location
    }
    "test" {
        Push-Location backend
        $env:PYTHONPATH = ".."
        pytest tests/ -v --cov=backend --cov-report=term-missing
        Pop-Location
    }
    "test-frontend" {
        Push-Location frontend
        npm run test
        Pop-Location
    }
    "lint" {
        Push-Location backend
        ruff check .
        Pop-Location
        Push-Location frontend
        npm run lint
        Pop-Location
    }
    "format" {
        Push-Location backend
        ruff format .
        Pop-Location
        Push-Location frontend
        npx prettier --write src/
        Pop-Location
    }
    "dev" {
        Write-Host "Starting backend and frontend (Local Mode without Docker)..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH='..'; cd backend; .\venv\Scripts\activate; uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
    }
    "clean" {
        Get-ChildItem -Path . -Include __pycache__ -Recurse -Directory -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
        Get-ChildItem -Path . -Include .pytest_cache -Recurse -Directory -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
        if (Test-Path frontend/dist) {
            Remove-Item -Recurse -Force frontend/dist
        }
        Write-Host "[OK] Cleaned up build artifacts" -ForegroundColor Green
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Show-Help
    }
}
