import logging
from backend.celery_app import celery_app
from backend.scraper.runner import run_all_spiders

logger = logging.getLogger(__name__)

@celery_app.task(name="backend.tasks.scraper_tasks.run_daily_scrapers")
def run_daily_scrapers():
    """
    Celery task to run all spiders.
    This triggers the scrapy runner synchronously in the Celery worker process.
    """
    logger.info("Starting daily scraper task...")
    try:
        run_all_spiders()
        logger.info("Daily scraper task completed successfully.")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error during daily scraper task: {str(e)}")
        return {"status": "error", "detail": str(e)}
