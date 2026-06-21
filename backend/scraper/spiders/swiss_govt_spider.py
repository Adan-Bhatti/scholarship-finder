import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class SwissGovtSpider(BaseScholarshipSpider):
    """Swiss Government Excellence Scholarships for international researchers and artists."""

    name = "swiss_govt"
    allowed_domains = ["sbfi.admin.ch"]
    start_urls = ["https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html"]

    def parse(self, response):
        deadline_text = response.css("time::text, .date::text").get(default="")
        desc_parts = response.css("main p::text, .field-body p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "Swiss Government Excellence Scholarship",
            "provider": "Swiss Federal Commission for Scholarships for Foreign Students (FCS)",
            "amount_min": 1920,
            "amount_max": 1920,
            "currency": "CHF",
            "deadline_text": deadline_text or "August - November (varies by country of origin)",
            "renewable": True,
            "degree_levels": ["Master's", "PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["Any"],
            "eligible_countries": ["Switzerland"],
            "gpa_requirement": 3.5,
            "description": description or (
                "Swiss Government Excellence Scholarships are offered by the Swiss Confederation "
                "to promote international exchange and research cooperation between Switzerland and "
                "over 180 other countries. Available for PhD research, postdoctoral research, and arts."
            ),
            "eligibility_text": (
                "Must be a citizen of a country in the list of partner countries. "
                "Must hold a master's degree (for PhD scholarship) or a PhD (for postdoc). "
                "Must be under 35 (PhD) or 40 (postdoc) years old. "
                "Application is made through the Swiss embassy in your home country."
            ),
            "application_url": "https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html",
            "source_url": response.url,
            "source_name": self.name,
        })
