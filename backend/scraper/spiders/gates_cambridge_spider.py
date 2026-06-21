import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class GatesCambridgeSpider(BaseScholarshipSpider):
    """Scraper for Gates Cambridge Scholarship at Cambridge University."""

    name = "gates_cambridge"
    allowed_domains = ["gatescambridge.org"]
    start_urls = ["https://www.gatescambridge.org/apply/"]

    def parse(self, response):
        # Extract eligibility and deadline info from page
        deadline_text = response.css(".deadline-info, .apply-deadline, time::text").get(default="")
        eligibility = response.css(".eligibility-section p::text, .who-can-apply p::text").getall()
        eligibility_text = " ".join(eligibility).strip()

        yield self.normalize_item({
            "title": "Gates Cambridge Scholarship",
            "provider": "Gates Foundation / University of Cambridge",
            "amount_min": 18000,
            "amount_max": 25000,
            "currency": "GBP",
            "deadline_text": deadline_text or "October (US applicants) / December (international applicants)",
            "renewable": True,
            "degree_levels": ["Master's", "PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["Any"],
            "eligible_countries": ["United Kingdom"],
            "gpa_requirement": 3.7,
            "description": (
                "The Gates Cambridge Scholarship is one of the most prestigious international "
                "scholarships in the world, awarded to outstanding applicants from outside the UK "
                "to pursue a full-time postgraduate degree at the University of Cambridge."
            ),
            "eligibility_text": eligibility_text or (
                "Open to all citizens of countries outside the UK. Must be applying to a full-time "
                "postgraduate degree at the University of Cambridge. Strong academic record required."
            ),
            "application_url": "https://www.gatescambridge.org/apply/",
            "source_url": response.url,
            "source_name": self.name,
        })
