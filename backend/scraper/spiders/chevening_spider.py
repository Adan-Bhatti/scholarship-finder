import scrapy
from backend.scraper.spiders.base_spider import BaseScholarshipSpider

class CheveningSpider(BaseScholarshipSpider):
    name = "chevening"
    allowed_domains = ["chevening.org"]
    start_urls = ["https://www.chevening.org/scholarships/"]
    
    def parse(self, response):
        # In a real implementation, we would extract data from the page.
        # Chevening is a single major scholarship program for international students.
        yield {
            "title": "Chevening Scholarship",
            "provider": "UK Government",
            "amount_min": None,
            "amount_max": None, # Fully funded
            "currency": "GBP",
            "deadline": "2024-11-05T12:00:00Z", # Example date
            "renewable": False,
            "degree_levels": ["Master's"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": [], # Over 160 countries
            "eligible_countries": ["United Kingdom"],
            "description": "Chevening is the UK government's international scholarships programme. Offered in 160 countries, it funds a one-year master's degree.",
            "eligibility_text": "Must be a citizen of a Chevening-eligible country. Must have an undergraduate degree. Must have two years' work experience.",
            "application_url": "https://www.chevening.org/apply/",
            "source_url": response.url,
            "source_name": self.name
        }
