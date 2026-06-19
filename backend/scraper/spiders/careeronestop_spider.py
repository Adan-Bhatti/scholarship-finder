import scrapy
from backend.scraper.spiders.base_spider import BaseScholarshipSpider

class CareerOneStopSpider(BaseScholarshipSpider):
    name = "careeronestop"
    allowed_domains = ["careeronestop.org"]
    start_urls = ["https://www.careeronestop.org/Toolkit/Training/find-scholarships.aspx"]
    
    def parse(self, response):
        yield {
            "title": "Federal Pell Grant",
            "provider": "U.S. Department of Education",
            "amount_min": 0.0,
            "amount_max": 7395.0, 
            "currency": "USD",
            "deadline": "2024-06-30T12:00:00Z", 
            "renewable": True,
            "degree_levels": ["Bachelor's"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["United States"],
            "eligible_countries": ["United States"],
            "description": "Federal Pell Grants usually are awarded only to undergraduate students who display exceptional financial need and have not earned a bachelor's, graduate, or professional degree.",
            "eligibility_text": "Must demonstrate financial need through the FAFSA. Must be a US citizen or eligible non-citizen.",
            "application_url": "https://studentaid.gov/understand-aid/types/grants/pell",
            "source_url": response.url,
            "source_name": self.name
        }
