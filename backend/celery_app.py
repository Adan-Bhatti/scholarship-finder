import os
from celery import Celery
from celery.schedules import crontab
from backend.core.config import settings

celery_app = Celery(
    "scholarship_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["backend.tasks.scraper_tasks", "backend.tasks.email_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Schedule periodic tasks
celery_app.conf.beat_schedule = {
    "run-scrapers-daily-midnight": {
        "task": "backend.tasks.scraper_tasks.run_daily_scrapers",
        "schedule": crontab(hour=0, minute=0), # Run every day at midnight
    },
    "send-deadline-reminders-daily": {
        "task": "backend.tasks.email_tasks.send_deadline_reminders",
        "schedule": crontab(hour=8, minute=0), # Run every day at 8 AM
    },
}
