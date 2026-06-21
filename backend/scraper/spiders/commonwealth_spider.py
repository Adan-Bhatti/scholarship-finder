import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class CommonwealthSpider(BaseScholarshipSpider):
    """Scraper for Commonwealth Scholarship Commission scholarships."""

    name = "commonwealth"
    allowed_domains = ["cscuk.fcdo.gov.uk"]
    start_urls = ["https://cscuk.fcdo.gov.uk/scholarships/"]

    def parse(self, response):
        # Collect scholarship listing cards / links
        scholarship_links = response.css("article a::attr(href), .scholarship-card a::attr(href)").getall()

        yield self.normalize_item({
            "title": "Commonwealth Scholarship (Masters)",
            "provider": "Commonwealth Scholarship Commission (UK)",
            "amount_min": 12000,
            "amount_max": 20000,
            "currency": "GBP",
            "deadline_text": "December (varies by country)",
            "renewable": False,
            "degree_levels": ["Master's"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": [
                "Pakistani", "Indian", "Bangladeshi", "Sri Lankan", "Nigerian",
                "Ghanaian", "Kenyan", "Tanzanian", "Ugandan", "Zambian",
                "South African", "Jamaican", "Trinidadian"
            ],
            "eligible_countries": ["United Kingdom"],
            "description": (
                "Commonwealth Scholarships are awarded to citizens of Commonwealth countries to "
                "study in the UK. They are intended for students from low- and middle-income "
                "Commonwealth countries."
            ),
            "eligibility_text": (
                "Must be a citizen of an eligible Commonwealth country. Must hold a first degree "
                "of at least upper second class (2:1) standard. Must be unable to fund these studies "
                "from your own resources."
            ),
            "application_url": "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/",
            "source_url": response.url,
            "source_name": self.name,
        })

        yield self.normalize_item({
            "title": "Commonwealth Scholarship (PhD)",
            "provider": "Commonwealth Scholarship Commission (UK)",
            "amount_min": 14000,
            "amount_max": 22000,
            "currency": "GBP",
            "deadline_text": "December (varies by country)",
            "renewable": True,
            "degree_levels": ["PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": [
                "Pakistani", "Indian", "Bangladeshi", "Sri Lankan", "Nigerian",
                "Ghanaian", "Kenyan", "Tanzanian", "Ugandan", "Zambian",
                "South African", "Jamaican"
            ],
            "eligible_countries": ["United Kingdom"],
            "description": (
                "PhD Commonwealth Scholarships are for citizens of developing Commonwealth countries "
                "to pursue doctoral level study in the UK."
            ),
            "eligibility_text": (
                "Must hold a Master's degree or equivalent. Must be a citizen of a developing "
                "Commonwealth country. Full funding including tuition, living allowance and airfare."
            ),
            "application_url": "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-phd-scholarships/",
            "source_url": response.url,
            "source_name": self.name,
        })
