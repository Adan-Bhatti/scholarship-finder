from scraper.base_spider import BaseScholarshipSpider

class FastwebSpider(BaseScholarshipSpider):
    name = "fastweb"
    allowed_domains = ["fastweb.com"]
    start_urls = ["https://www.fastweb.com/college-scholarships/articles/"]

    def parse(self, response):
        # NOTE: This is a dry-run implementation
        # In a real scenario, this would use CSS selectors to extract links
        # e.g., for article in response.css('.article-item'):
        
        # Mocking a parsed item
        raw_data = {
            "title": "Fastweb Merit Scholarship",
            "provider": "Fastweb",
            "description": "A merit-based scholarship for outstanding students.",
            "amount_text": "$5,000",
            "deadline_text": "December 31, 2026",
            "source_url": response.url,
            "degree_levels": ["Undergraduate"],
        }
        
        yield self.normalize_item(raw_data)
