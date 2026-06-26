import os
import sys
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings

# Make sure Scrapy can find our settings
os.environ.setdefault('SCRAPY_SETTINGS_MODULE', 'backend.scraper.settings')

def run_all_spiders():
    """
    Entry point for the daily scheduled job (e.g. via Celery).
    Runs all spiders sequentially or concurrently depending on Twisted reactor setup.
    """
    settings = get_project_settings()
    process = CrawlerProcess(settings)
    
    # Original sources
    process.crawl('fastweb')
    process.crawl('scholarships_com')
    process.crawl('hec')
    process.crawl('chevening')
    process.crawl('fulbright')
    process.crawl('daad')
    process.crawl('bold')
    process.crawl('careeronestop')
    process.crawl('scholars4dev')
    # New international sources
    process.crawl('gates_cambridge')
    process.crawl('australia_awards')
    process.crawl('erasmus_mundus')
    process.crawl('rhodes')
    process.crawl('commonwealth')
    process.crawl('vanier')
    process.crawl('mastercard_foundation')
    process.crawl('aga_khan')
    process.crawl('kaust')
    # New international sources (batch 2)
    process.crawl('mext')
    process.crawl('kgsp')
    process.crawl('turkiye_burslari')
    process.crawl('csc_china')
    process.crawl('eiffel')
    process.crawl('swiss_govt')
    process.crawl('world_bank')
    process.crawl('isdb')
    process.crawl('humboldt')

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
