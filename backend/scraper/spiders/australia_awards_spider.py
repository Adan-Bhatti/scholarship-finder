import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class AustraliaAwardsSpider(BaseScholarshipSpider):
    """Scraper for Australia Awards Scholarships."""

    name = "australia_awards"
    allowed_domains = ["australiaawardsindia.org", "australiaawards.gov.au", "dfat.gov.au"]
    start_urls = ["https://www.dfat.gov.au/people-to-people/australia-awards/Pages/australia-awards-scholarships"]

    def parse(self, response):
        deadline_text = response.css(".deadline, time::text, .date-info::text").get(default="")
        description_parts = response.css("main p::text, .content-body p::text").getall()
        description = " ".join(description_parts[:3]).strip()

        yield self.normalize_item({
            "title": "Australia Awards Scholarship",
            "provider": "Australian Government (DFAT)",
            "amount_min": 20000,
            "amount_max": 45000,
            "currency": "AUD",
            "deadline_text": deadline_text or "April (varies by country)",
            "renewable": True,
            "degree_levels": ["Undergraduate", "Master's", "PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": [
                "Pakistani", "Indian", "Bangladeshi", "Sri Lankan", "Nepali",
                "Indonesian", "Filipino", "Vietnamese", "Cambodian", "Myanmar"
            ],
            "eligible_countries": ["Australia"],
            "description": description or (
                "Australia Awards Scholarships are prestigious international scholarships funded "
                "by the Australian Government. They provide citizens from developing countries "
                "with opportunities to undertake full degree study in Australia."
            ),
            "eligibility_text": (
                "Open to citizens from eligible developing countries. Must not be a permanent "
                "resident of Australia. Applicants must meet age requirements and demonstrate "
                "leadership potential."
            ),
            "application_url": "https://www.dfat.gov.au/people-to-people/australia-awards/",
            "source_url": response.url,
            "source_name": self.name,
        })
