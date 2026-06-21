import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class IslamicDevelopmentBankSpider(BaseScholarshipSpider):
    """Islamic Development Bank (IsDB) Merit Scholarship for international students."""

    name = "isdb"
    allowed_domains = ["isdb.org"]
    start_urls = ["https://www.isdb.org/what-we-do/human-development/scholarships"]

    def parse(self, response):
        deadline_text = response.css("time::text, .date::text").get(default="")
        desc_parts = response.css("main p::text, .rich-text p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "Islamic Development Bank Merit Scholarship Programme",
            "provider": "Islamic Development Bank (IsDB)",
            "amount_min": 8000,
            "amount_max": 20000,
            "currency": "USD",
            "deadline_text": deadline_text or "February - April annually",
            "renewable": True,
            "degree_levels": ["Master's", "PhD"],
            "fields_of_study": [
                "Science", "Engineering", "Technology", "Medicine", "Agriculture",
                "Computer Science", "Mathematics", "Physics", "Chemistry"
            ],
            "eligible_nationalities": [
                "Pakistani", "Bangladeshi", "Afghan", "Indonesian", "Malaysian",
                "Turkish", "Egyptian", "Nigerian", "Senegalese", "Malian",
                "Guinean", "Gambian", "Moroccan", "Tunisian", "Algerian",
                "Libyan", "Saudi", "Jordanian", "Palestinian", "Yemeni",
                "Iraqi", "Syrian", "Lebanese", "Kazakh", "Uzbek", "Kyrgyz",
                "Tajik", "Azerbaijani", "Albanian", "Sudanese", "Somali",
                "Ugandan", "Mozambican", "Surinamese", "Comoran"
            ],
            "eligible_countries": [
                "Any"
            ],
            "description": description or (
                "The IsDB Merit Scholarship Programme for High Technology aims to build the "
                "technological capacity of IsDB member countries by providing scholarships to "
                "outstanding students to pursue masters and doctoral degrees in science and technology fields."
            ),
            "eligibility_text": (
                "Must be a Muslim national of an IsDB member country. Must be under 35 years for "
                "masters and under 40 for PhD. Must have strong academic record (minimum B+ or equivalent). "
                "Must commit to returning to home country after completing studies."
            ),
            "application_url": "https://www.isdb.org/what-we-do/human-development/scholarships",
            "source_url": response.url,
            "source_name": self.name,
        })
