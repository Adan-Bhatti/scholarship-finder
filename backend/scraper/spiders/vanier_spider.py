import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class VanierSpider(BaseScholarshipSpider):
    """Scraper for Vanier Canada Graduate Scholarships."""

    name = "vanier"
    allowed_domains = ["vanier.gc.ca", "vanier-banting.gc.ca"]
    start_urls = ["https://vanier.gc.ca/en/home-accueil.html"]

    def parse(self, response):
        deadline_text = response.css(".deadline, time::text").get(default="")
        desc_parts = response.css("main p::text, .home-page p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "Vanier Canada Graduate Scholarship",
            "provider": "Government of Canada",
            "amount_min": 50000,
            "amount_max": 50000,
            "currency": "CAD",
            "deadline_text": deadline_text or "November (internal university deadlines earlier)",
            "renewable": True,
            "degree_levels": ["PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["Any"],
            "eligible_countries": ["Canada"],
            "gpa_requirement": 3.7,
            "description": description or (
                "The Vanier Canada Graduate Scholarships program was created to attract and retain "
                "world-class doctoral students and to establish Canada as a global centre of excellence "
                "in research and higher learning. Valued at $50,000 per year for three years."
            ),
            "eligibility_text": (
                "Open to Canadian citizens, permanent residents, and international students. "
                "Must be nominated by a Canadian university. Must be pursuing a doctoral degree at "
                "a Canadian institution. Must not have started more than 20 months of doctoral studies."
            ),
            "application_url": "https://vanier.gc.ca/en/how_to_apply-comment_postuler.html",
            "source_url": response.url,
            "source_name": self.name,
        })
