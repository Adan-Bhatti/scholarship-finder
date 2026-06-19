import scrapy
from backend.scraper.spiders.base_spider import BaseScholarshipSpider

class DAADSpider(BaseScholarshipSpider):
    name = "daad"
    allowed_domains = ["daad.de", "www2.daad.de"]
    start_urls = ["https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/"]
    
    def parse(self, response):
        # Scrapy logic would iterate over the paginated list of DAAD scholarships.
        # For this demonstration, we yield a representation of the main DAAD EPOS program.
        yield {
            "title": "DAAD EPOS Scholarships for Development-Related Postgraduate Courses",
            "provider": "German Academic Exchange Service (DAAD)",
            "amount_min": 934.0,
            "amount_max": 1300.0, 
            "currency": "EUR",
            "deadline": "2024-12-01T12:00:00Z", # Varies by university
            "renewable": True,
            "degree_levels": ["Master's", "Ph.D."],
            "fields_of_study": ["Engineering", "Mathematics", "Science", "Agriculture", "Social Sciences"],
            "eligible_nationalities": ["Developing Countries"], # Target specific DAC list countries
            "eligible_countries": ["Germany"],
            "description": "The scholarships offer foreign graduates from development and newly industrialised countries from all disciplines the chance to take a postgraduate or Master's degree at a state or state-recognised German university.",
            "eligibility_text": "Graduates with at least two years' professional experience from developing countries. Academic degrees should normally not be more than six years old.",
            "application_url": "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/",
            "source_url": response.url,
            "source_name": self.name
        }
