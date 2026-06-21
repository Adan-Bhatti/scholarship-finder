import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class EiffelSpider(BaseScholarshipSpider):
    """Eiffel Excellence Scholarship Programme — French Government scholarship for international students."""

    name = "eiffel"
    allowed_domains = ["campusfrance.org"]
    start_urls = ["https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence"]

    def parse(self, response):
        deadline_text = response.css("time::text, .date::text, .deadline::text").get(default="")
        desc_parts = response.css(".field-body p::text, main p::text, article p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "Eiffel Excellence Scholarship Programme",
            "provider": "Campus France / French Ministry of Europe and Foreign Affairs",
            "amount_min": 1181,
            "amount_max": 1400,
            "currency": "EUR",
            "deadline_text": deadline_text or "January (French institutions must submit nominations)",
            "renewable": True,
            "degree_levels": ["Master's", "PhD"],
            "fields_of_study": [
                "Engineering", "Science", "Economics", "Law", "Political Science",
                "Management", "Computer Science"
            ],
            "eligible_nationalities": ["Any"],
            "eligible_countries": ["France"],
            "description": description or (
                "The Eiffel Excellence Scholarship Programme was established by the French Ministry "
                "of Europe and Foreign Affairs to attract top foreign students to French higher education "
                "in master's and PhD programmes at French institutions."
            ),
            "eligibility_text": (
                "Must be a foreign national. Age limit: under 30 for masters, under 35 for PhD. "
                "Must be nominated by a French higher education institution. "
                "Priority given to students from targeted countries. Strong academic record required."
            ),
            "application_url": "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence",
            "source_url": response.url,
            "source_name": self.name,
        })
