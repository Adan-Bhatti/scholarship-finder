from fastapi import APIRouter, Depends, BackgroundTasks
from backend.routers.auth import get_current_user
from backend.models.user import User
from backend.scraper.http_runner import run_all_scrapers

router = APIRouter(prefix="/scraper", tags=["scraper"])


def run_scraper_background():
    """Wrapper for backwards compatibility with APScheduler."""
    run_all_scrapers()


@router.post("/run")
def trigger_scraper(background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user)):
    background_tasks.add_task(run_all_scrapers)
    return {"message": "Lightweight scraper started in the background. Check back in a few minutes!"}


from backend.tasks.email_tasks import send_deadline_reminders


@router.post("/reminders")
def trigger_reminders(background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user)):
    background_tasks.add_task(send_deadline_reminders)
    return {"message": "Deadline reminders triggered in the background."}
