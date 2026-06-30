import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class MastercardFoundationSpider(BaseScholarshipSpider):
    """Scraper for Mastercard Foundation Scholars Program."""

    name = "mastercard_foundation"
    allowed_domains = ["mastercardfdn.org", "scholars.mastercardfdn.org"]
    start_urls = ["https://mastercardfdn.org/all-programs/scholars-program/"]

    def parse(self, response: scrapy.http.Response):
        """Parse Mastercard Foundation page and extract details."""
        deadline_text = response.css(".deadline, time::text").get(default="")
        desc_parts = response.css(".entry-content p::text, main p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "Mastercard Foundation Scholars Program",
            "provider": "Mastercard Foundation",
            "amount_min": 20000,
            "amount_max": 60000,
            "currency": "USD",
            "deadline_text": deadline_text or "Varies by partner university",
            "renewable": True,
            "degree_levels": ["Undergraduate", "Master's"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": [
                "Nigerian", "Kenyan", "Ghanaian", "Ethiopian", "Ugandan",
                "Tanzanian", "Rwandan", "Senegalese", "Zambian", "Malawian",
                "Mozambican", "South African", "Egyptian"
            ],
            "eligible_countries": [
                "United States", "Canada", "United Kingdom", "Rwanda", "Ghana",
                "Nigeria", "Kenya", "South Africa"
            ],
            "description": description or (
                "The Mastercard Foundation Scholars Program works with leading African universities "
                "and universities in Canada, United States, and UK to enable young people from "
                "marginalized communities, especially girls, to access world-class education."
            ),
            "eligibility_text": (
                "Must be an African citizen, particularly from Sub-Saharan Africa. "
                "Must demonstrate academic excellence and financial need. Must show commitment "
                "to giving back to their communities. Must be under 35 years of age."
            ),
            "application_url": "https://mastercardfdn.org/all-programs/scholars-program/becoming-a-scholar/",
            "source_url": response.url,
            "source_name": self.name,
        })
