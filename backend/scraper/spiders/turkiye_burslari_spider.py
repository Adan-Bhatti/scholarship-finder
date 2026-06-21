import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class TurkiyeBurslariSpider(BaseScholarshipSpider):
    """Türkiye Burslari (Turkish Government Scholarship) for international students."""

    name = "turkiye_burslari"
    allowed_domains = ["turkiyeburslari.gov.tr"]
    start_urls = ["https://www.turkiyeburslari.gov.tr/en"]

    def parse(self, response):
        deadline_text = response.css("time::text, .date::text").get(default="")
        desc_parts = response.css("main p::text, .content-text p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "Türkiye Burslari (Turkish Government Scholarship)",
            "provider": "Republic of Turkey, Presidency for Turks Abroad and Related Communities",
            "amount_min": 800,
            "amount_max": 1700,
            "currency": "TRY",
            "deadline_text": deadline_text or "February 10 - March 20 annually",
            "renewable": True,
            "degree_levels": ["Undergraduate", "Master's", "PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["Any"],
            "eligible_countries": ["Turkey"],
            "description": description or (
                "Türkiye Burslari scholarships are offered by the Turkish Government to international "
                "students for undergraduate, master's, and doctoral programmes at Turkish universities. "
                "Includes monthly stipend, free accommodation, health insurance, and Turkish language course."
            ),
            "eligibility_text": (
                "Must not be a Turkish citizen. Age limits: under 21 for undergraduate, "
                "under 30 for masters, under 35 for PhD. Must not currently be studying in Turkey. "
                "Open to students from all countries worldwide."
            ),
            "application_url": "https://www.turkiyeburslari.gov.tr/en/apply",
            "source_url": response.url,
            "source_name": self.name,
        })
