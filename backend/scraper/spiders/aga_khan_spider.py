import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class AKFSpider(BaseScholarshipSpider):
    """Scraper for Aga Khan Foundation International Scholarship Programme."""

    name = "aga_khan"
    allowed_domains = ["akdn.org", "akf.aku.edu"]
    start_urls = ["https://www.akdn.org/our-agencies/aga-khan-foundation/international-scholarship-programme"]

    def parse(self, response):
        deadline_text = response.css(".deadline, time::text, .field-date::text").get(default="")
        desc_parts = response.css(".field--type-text-with-summary p::text, article p::text, main p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "Aga Khan Foundation International Scholarship",
            "provider": "Aga Khan Foundation (AKF)",
            "amount_min": 10000,
            "amount_max": 30000,
            "currency": "USD",
            "deadline_text": deadline_text or "March 31 annually",
            "renewable": True,
            "degree_levels": ["Master's", "PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": [
                "Pakistani", "Afghan", "Indian", "Bangladeshi", "Kenyan",
                "Tanzanian", "Ugandan", "Mozambican", "Tajik", "Kyrgyz",
                "Syrian", "Egyptian"
            ],
            "eligible_countries": [
                "United States", "United Kingdom", "Canada", "Australia",
                "Germany", "France"
            ],
            "description": description or (
                "The Aga Khan Foundation (AKF) International Scholarship Programme provides a "
                "limited number of scholarships each year for postgraduate studies to outstanding "
                "students from developing countries who have no other means of funding their studies."
            ),
            "eligibility_text": (
                "Must be a citizen of a developing country where AKF operates. Must demonstrate "
                "financial need. Must have an excellent academic record. Scholarships are in the "
                "form of a half-grant, half-loan package."
            ),
            "application_url": "https://www.akdn.org/our-agencies/aga-khan-foundation/international-scholarship-programme",
            "source_url": response.url,
            "source_name": self.name,
        })
