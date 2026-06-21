import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider

class FulbrightSpider(BaseScholarshipSpider):
    name = "fulbright"
    allowed_domains = ["fulbrightprogram.org", "foreign.fulbrightonline.org"]
    start_urls = ["https://foreign.fulbrightonline.org/"]
    
    def parse(self, response):
        yield {
            "title": "Fulbright Foreign Student Program",
            "provider": "U.S. Department of State",
            "amount_min": None,
            "amount_max": None, # Fully funded
            "currency": "USD",
            "deadline": "2024-10-15T12:00:00Z", # Dates vary by country
            "renewable": True,
            "degree_levels": ["Master's", "Ph.D."],
            "fields_of_study": ["Any"],
            "eligible_nationalities": [], # Varies, usually international
            "eligible_countries": ["United States"],
            "description": "The Fulbright Foreign Student Program enables graduate students, young professionals and artists from abroad to study and conduct research in the United States.",
            "eligibility_text": "Program eligibility and selection procedures vary widely by country. Please select your home country from the dropdown menu to view specific information.",
            "application_url": "https://foreign.fulbrightonline.org/apply",
            "source_url": response.url,
            "source_name": self.name
        }
