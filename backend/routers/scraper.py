from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from backend.routers.auth import get_current_user
from backend.models.user import User
import subprocess
import os

router = APIRouter(prefix="/scraper", tags=["scraper"])

def run_scraper_background():
    try:
        # Run the Scrapy runner using python
        subprocess.run(
            ["python", "backend/scraper/runner.py"], 
            cwd=os.getcwd(),
            check=True
        )
    except Exception as e:
        print(f"Scraper failed: {e}")

@router.post("/run")
def trigger_scraper(background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user)):
    # In a real app, verify if current_user is admin
    background_tasks.add_task(run_scraper_background)
    return {"message": "Scraper started in the background."}
