import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

BOT_NAME = 'scholarship_finder'

SPIDER_MODULES = ['backend.scraper.spiders']
NEWSPIDER_MODULE = 'backend.scraper.spiders'

USER_AGENT = os.environ.get("SCRAPER_USER_AGENT", "Mozilla/5.0 (compatible; ScholarshipBot/1.0)")
ROBOTSTXT_OBEY = True
CONCURRENT_REQUESTS = 16

# Configure a delay for requests for the same website
DOWNLOAD_DELAY = 2
CONCURRENT_REQUESTS_PER_DOMAIN = 8

ITEM_PIPELINES = {
   'backend.scraper.pipelines.dedup_pipeline.DedupPipeline': 300,
   'backend.scraper.pipelines.db_pipeline.DatabasePipeline': 400,
}

# Playwright settings (enabled for JS-rendered sites)
DOWNLOAD_HANDLERS = {
    "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
    "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
}

TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"

PLAYWRIGHT_LAUNCH_OPTIONS = {
    "headless": os.environ.get("PLAYWRIGHT_HEADLESS", "true").lower() == "true",
}

REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
FEED_EXPORT_ENCODING = "utf-8"
