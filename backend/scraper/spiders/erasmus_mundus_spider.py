import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class ErasmusMundusSpider(BaseScholarshipSpider):
    """Scraper for Erasmus Mundus Joint Master Degrees scholarships."""

    name = "erasmus_mundus"
    allowed_domains = ["erasmus-plus.ec.europa.eu", "eacea.ec.europa.eu"]
    start_urls = [
        "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters-scholarships"
    ]

    def parse(self, response):
        deadline_text = response.css(".deadline, time::text, .field--type-datetime::text").get(default="")
        desc_parts = response.css(".field--type-text-with-summary p::text, main p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "Erasmus Mundus Joint Master Degree Scholarship",
            "provider": "European Commission",
            "amount_min": 1000,
            "amount_max": 2500,  # per month
            "currency": "EUR",
            "deadline_text": deadline_text or "January - March (varies by programme)",
            "renewable": True,
            "degree_levels": ["Master's"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["Any"],
            "eligible_countries": [
                "Germany", "France", "Spain", "Italy", "Netherlands", "Belgium",
                "Sweden", "Finland", "Austria", "Portugal"
            ],
            "description": description or (
                "Erasmus Mundus Joint Master Degrees (EMJMD) are high-level, integrated international "
                "study programmes taught by international consortia of higher education institutions "
                "from different countries across Europe and beyond."
            ),
            "eligibility_text": (
                "Open to students worldwide. Must apply to a specific EMJMD programme. "
                "Scholarship covers tuition, living costs, travel and insurance. "
                "Preference given to students from outside the European Union."
            ),
            "application_url": "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters-scholarships",
            "source_url": response.url,
            "source_name": self.name,
        })
