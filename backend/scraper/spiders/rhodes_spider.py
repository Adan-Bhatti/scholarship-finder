import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class RhodesSpider(BaseScholarshipSpider):
    """Scraper for Rhodes Scholarship at University of Oxford."""

    name = "rhodes"
    allowed_domains = ["rhodeshouse.ox.ac.uk"]
    start_urls = ["https://www.rhodeshouse.ox.ac.uk/scholarships/"]

    def parse(self, response: scrapy.http.Response):
        """Parse Rhodes Scholarship page and extract details."""
        deadline_text = response.css(".deadline, time::text, .application-deadline::text").get(default="")
        desc_parts = response.css(".hero-text p::text, main p::text, .content p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        # Rhodes scholarships are offered from specific countries — extract them if listed
        country_items = response.css(".country-list li::text, .eligible-countries li::text").getall()
        eligible_nationalities = [c.strip() for c in country_items if c.strip()] or ["Any"]

        yield self.normalize_item({
            "title": "Rhodes Scholarship",
            "provider": "Rhodes Trust",
            "amount_min": 25000,
            "amount_max": 35000,
            "currency": "USD",
            "deadline_text": deadline_text or "October (varies by country)",
            "renewable": True,
            "degree_levels": ["Master's", "PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": eligible_nationalities,
            "eligible_countries": ["United Kingdom"],
            "gpa_requirement": 3.7,
            "description": description or (
                "The Rhodes Scholarship is the oldest and most celebrated international scholarship "
                "in the world. Rhodes Scholars are selected from 64 countries and territories to "
                "study at the University of Oxford."
            ),
            "eligibility_text": (
                "Must be a citizen of a Rhodes-eligible country. Age limits apply (typically 18-24 "
                "for most constituencies). Exceptional academic achievement required. Must demonstrate "
                "leadership, service, and personal character."
            ),
            "application_url": "https://www.rhodeshouse.ox.ac.uk/scholarships/apply/",
            "source_url": response.url,
            "source_name": self.name,
        })
