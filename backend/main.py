from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from backend.routers import auth, profile, scholarships, health, ai, dashboard, scraper
from backend.core.exceptions import BaseAPIException
import logging
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from backend.core.limiter import limiter
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from backend.routers.scraper import run_scraper_background
from backend.tasks.email_tasks import send_deadline_reminders

logger = logging.getLogger(__name__)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Scholarship Finder AI",
    description="Backend API for the AI-powered Scholarship Finder",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = BackgroundScheduler()

@app.on_event("startup")
def start_scheduler():
    scheduler.add_job(
        run_scraper_background,
        trigger=IntervalTrigger(hours=24),
        id="run_scraper_daily",
        name="Scrape Scholarships Every 24h",
        replace_existing=True
    )
    scheduler.add_job(
        send_deadline_reminders,
        trigger=IntervalTrigger(hours=24),
        id="send_email_reminders_daily",
        name="Send Deadline Reminders Every 24h",
        replace_existing=True
    )
    scheduler.start()
    logger.info("APScheduler started successfully.")

@app.on_event("shutdown")
def stop_scheduler():
    scheduler.shutdown()
    logger.info("APScheduler shutdown.")

@app.exception_handler(BaseAPIException)
async def custom_api_exception_handler(request: Request, exc: BaseAPIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.__class__.__name__, "detail": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        # Format the error location path nicely
        loc_path = [str(x) for x in error.get("loc", []) if x != "body"]
        loc = " -> ".join(loc_path) if loc_path else "field"
        msg = error.get("msg", "Invalid value")
        # Strip "Value error, " prefix from custom validation messages if present
        if msg.startswith("Value error, "):
            msg = msg[len("Value error, "):]
        errors.append(f"{loc}: {msg}")
    
    return JSONResponse(
        status_code=400,
        content={
            "error": "ValidationError",
            "detail": "; ".join(errors)
        }
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "InternalServerError", "detail": "An unexpected error occurred."},
    )

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(scholarships.router)
app.include_router(ai.router)
app.include_router(dashboard.router)
app.include_router(scraper.router)
