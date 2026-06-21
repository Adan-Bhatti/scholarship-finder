import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class WorldBankSpider(BaseScholarshipSpider):
    """World Bank / Joint Japan-World Bank Graduate Scholarship Program (JJ/WBGSP)."""

    name = "world_bank"
    allowed_domains = ["worldbank.org"]
    start_urls = ["https://www.worldbank.org/en/programs/scholarships"]

    def parse(self, response):
        deadline_text = response.css("time::text, .date-label::text").get(default="")
        desc_parts = response.css("main p::text, .rich-text p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        # Joint Japan-World Bank Graduate Scholarship
        yield self.normalize_item({
            "title": "Joint Japan/World Bank Graduate Scholarship Program (JJ/WBGSP)",
            "provider": "World Bank / Government of Japan",
            "amount_min": 12000,
            "amount_max": 30000,
            "currency": "USD",
            "deadline_text": deadline_text or "April annually",
            "renewable": False,
            "degree_levels": ["Master's"],
            "fields_of_study": [
                "Economics", "Public Policy", "Development Studies", "Agriculture",
                "Environmental Science", "Education", "Public Health", "Engineering"
            ],
            "eligible_nationalities": ["Any"],
            "eligible_countries": [
                "United States", "United Kingdom", "Japan", "France", "Germany",
                "Belgium", "Australia", "Canada", "Netherlands"
            ],
            "description": description or (
                "The Joint Japan/World Bank Graduate Scholarship Program (JJ/WBGSP) was established "
                "to help mid-career professionals from developing countries pursue graduate degrees in "
                "development-related subjects at accredited universities worldwide."
            ),
            "eligibility_text": (
                "Must be a national of a World Bank member developing country. "
                "Must be under 45 years old. Must have at least 3 years of relevant work experience. "
                "Must be currently employed in development-related work. "
                "Must not be working for or related to World Bank Group staff."
            ),
            "application_url": "https://www.worldbank.org/en/programs/scholarships",
            "source_url": response.url,
            "source_name": self.name,
        })

        # Robert S. McNamara Fellowships
        yield self.normalize_item({
            "title": "Robert S. McNamara Fellowships Program",
            "provider": "World Bank",
            "amount_min": 25000,
            "amount_max": 30000,
            "currency": "USD",
            "deadline_text": "January annually",
            "renewable": False,
            "degree_levels": ["PhD"],
            "fields_of_study": [
                "Economics", "Social Sciences", "Public Policy", "Development Studies"
            ],
            "eligible_nationalities": ["Any"],
            "eligible_countries": [
                "United States", "United Kingdom", "France", "Germany",
                "Belgium", "Netherlands", "Canada", "Australia"
            ],
            "description": (
                "The Robert S. McNamara Fellowships Program provides financial support to doctoral "
                "students from developing countries to conduct dissertation research at a host "
                "institution in a developed country."
            ),
            "eligibility_text": (
                "Must be a national of a developing World Bank member country. "
                "Must be currently enrolled in a doctoral program at an accredited university in "
                "a developing country. Must have completed all coursework and be in the dissertation phase."
            ),
            "application_url": "https://www.worldbank.org/en/programs/scholarships",
            "source_url": response.url,
            "source_name": self.name,
        })
