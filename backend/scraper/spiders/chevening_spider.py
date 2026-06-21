import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider

class CheveningSpider(BaseScholarshipSpider):
    name = "chevening"
    allowed_domains = ["chevening.org"]
    start_urls = ["https://www.chevening.org/apply/"]
    
    def parse(self, response):
        # Extract all eligible countries from the apply page's country list
        # Look for links that contain "/scholarship/" in their href
        country_links = response.css('a[href*="/scholarship/"]::text').getall()
        
        # Clean up country names: e.g., "Afghanistan (Chevening Scholarship)" -> "Afghanistan"
        eligible_countries = []
        for text in country_links:
            clean_name = text.split('(Chevening')[0].strip()
            if clean_name and clean_name not in eligible_countries:
                eligible_countries.append(clean_name)

        yield self.normalize_item({
            "title": "Chevening Scholarship",
            "provider": "UK Government",
            "amount_min": None,
            "amount_max": None, # Fully funded
            "currency": "GBP",
            "deadline_text": "Annually in November",
            "renewable": False,
            "degree_levels": ["Masters"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": eligible_countries, # Use scraped dynamic list
            "eligible_countries": ["UK"],
            "description": "Chevening is the UK government's international scholarships programme. Offered in 160 countries, it funds a one-year master's degree.",
            "eligibility_text": "Must be a citizen of a Chevening-eligible country. Must have an undergraduate degree. Must have two years' work experience.",
            "application_url": "https://www.chevening.org/apply/",
            "source_url": response.url,
            "source_name": self.name
        })
