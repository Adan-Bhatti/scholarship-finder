import os
import sys
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings

# Make sure Scrapy can find our settings
os.environ.setdefault('SCRAPY_SETTINGS_MODULE', 'scraper.settings')

def run_all_spiders():
    """
    Entry point for the daily scheduled job (e.g. via Celery).
    Runs all spiders sequentially or concurrently depending on Twisted reactor setup.
    """
    settings = get_project_settings()
    process = CrawlerProcess(settings)
    
    # In a real scenario, you could use spider names dynamically, but here we list them.
    process.crawl('fastweb')
    process.crawl('scholarships_com')
    process.crawl('hec')
    process.crawl('chevening')
    process.crawl('fulbright')
    process.crawl('daad')
    process.crawl('bold')
    process.crawl('careeronestop')
    
    process.start()

def run_tier1_spiders():
    """
    Entry point for hourly high-priority scheduled jobs.
    """
    settings = get_project_settings()
    process = CrawlerProcess(settings)
    
    process.crawl('fastweb')
    process.start()

if __name__ == "__main__":
    run_all_spiders()
