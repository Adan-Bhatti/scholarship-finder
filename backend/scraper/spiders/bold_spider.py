import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider

class BoldSpider(BaseScholarshipSpider):
    name = "bold"
    allowed_domains = ["bold.org"]
    start_urls = ["https://bold.org/scholarships/"]
    
    def parse(self, response):
        yield {
            "title": "Bold.org 'No Essay' Smart Owl Scholarship",
            "provider": "ScholarshipOwl via Bold",
            "amount_min": 7000.0,
            "amount_max": 7000.0, 
            "currency": "USD",
            "deadline": "2024-09-30T23:59:00Z", 
            "renewable": False,
            "degree_levels": ["High School", "Bachelor's", "Master's", "Ph.D."],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["United States"],
            "eligible_countries": ["United States"],
            "description": "The ScholarshipOwl 'No Essay' Scholarship is an easy scholarship with no essay required! We want to help you achieve your education goals.",
            "eligibility_text": "Must be 16 years of age or older. Must be enrolled in a high school or college in the United States.",
            "application_url": "https://bold.org/scholarships/smart-owl-scholarship/",
            "source_url": response.url,
            "source_name": self.name
        }
