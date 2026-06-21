import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class HumboldtSpider(BaseScholarshipSpider):
    """Alexander von Humboldt Foundation Research Fellowships — Germany."""

    name = "humboldt"
    allowed_domains = ["humboldt-foundation.de"]
    start_urls = ["https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/humboldt-research-fellowship"]

    def parse(self, response):
        deadline_text = response.css("time::text, .date::text").get(default="")
        desc_parts = response.css("main p::text, .rich-text-content p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "Humboldt Research Fellowship (Postdoctoral)",
            "provider": "Alexander von Humboldt Foundation",
            "amount_min": 2670,
            "amount_max": 3170,
            "currency": "EUR",
            "deadline_text": "Rolling applications accepted year-round",
            "renewable": False,
            "degree_levels": ["PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["Any"],
            "eligible_countries": ["Germany"],
            "description": description or (
                "The Humboldt Research Fellowship for Postdoctoral Researchers allows highly-qualified "
                "scientists and scholars from abroad to carry out long-term research projects (6-24 months) "
                "in Germany. The fellowship is open to all nationalities and research fields."
            ),
            "eligibility_text": (
                "Must hold a doctoral degree (received within 4 years of application). "
                "Must not have spent more than 12 months in Germany in the last 3 years. "
                "Must have an excellent research record. Application can be submitted at any time."
            ),
            "application_url": "https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/humboldt-research-fellowship",
            "source_url": response.url,
            "source_name": self.name,
        })

        yield self.normalize_item({
            "title": "Humboldt Research Fellowship (Experienced Researcher)",
            "provider": "Alexander von Humboldt Foundation",
            "amount_min": 3170,
            "amount_max": 3670,
            "currency": "EUR",
            "deadline_text": "Rolling applications accepted year-round",
            "renewable": False,
            "degree_levels": ["PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["Any"],
            "eligible_countries": ["Germany"],
            "description": (
                "The Humboldt Research Fellowship for Experienced Researchers supports internationally "
                "experienced researchers to carry out research projects in Germany for 6-18 months. "
                "Open to all nationalities and disciplines."
            ),
            "eligibility_text": (
                "Must hold a doctoral degree received more than 4 years ago. "
                "Must have an internationally recognized research profile. "
                "Must not have spent more than 12 months in Germany in the last 3 years."
            ),
            "application_url": "https://www.humboldt-foundation.de/en/apply/sponsorship-programmes/humboldt-research-fellowship",
            "source_url": response.url,
            "source_name": self.name,
        })
