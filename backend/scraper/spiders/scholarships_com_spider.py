from backend.scraper.base_spider import BaseScholarshipSpider

class ScholarshipsComSpider(BaseScholarshipSpider):
    name = "scholarships_com"
    allowed_domains = ["scholarships.com"]
    start_urls = ["https://www.scholarships.com/financial-aid/college-scholarships/"]

    def parse(self, response):
        # NOTE: Dry-run implementation
        raw_data = {
            "title": "Excellence in STEM Scholarship",
            "provider": "Scholarships.com Foundation",
            "description": "Targeted at students entering STEM fields.",
            "amount_text": "$1000 - $3000",
            "deadline_text": "March 15, 2026",
            "source_url": response.url,
            "fields_of_study": ["Computer Science", "Engineering"],
            "degree_levels": ["Undergraduate", "High School"]
        }
        
        yield self.normalize_item(raw_data)
