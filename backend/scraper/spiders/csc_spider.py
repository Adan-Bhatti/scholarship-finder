import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class CSCSpider(BaseScholarshipSpider):
    """Chinese Government Scholarship (CSC) for international students."""

    name = "csc_china"
    allowed_domains = ["campuschina.org", "csc.edu.cn"]
    start_urls = ["https://www.campuschina.org/scholarships/index.html"]

    def parse(self, response):
        deadline_text = response.css("time::text, .date::text").get(default="")
        desc_parts = response.css("main p::text, .article-content p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "Chinese Government Scholarship (CSC Full Scholarship)",
            "provider": "China Scholarship Council (CSC) / Ministry of Education China",
            "amount_min": 2500,
            "amount_max": 3500,
            "currency": "CNY",
            "deadline_text": deadline_text or "January - April (varies by programme type)",
            "renewable": True,
            "degree_levels": ["Undergraduate", "Master's", "PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["Any"],
            "eligible_countries": ["China"],
            "description": description or (
                "The Chinese Government Scholarship (CSC) offers full funding for international "
                "students to pursue undergraduate, postgraduate, and doctoral degrees at Chinese "
                "universities. Covers tuition, accommodation, insurance, and monthly stipend."
            ),
            "eligibility_text": (
                "Must be a non-Chinese citizen in good health. Must hold relevant academic "
                "qualifications. Age limit: under 25 for undergraduate, under 35 for masters, "
                "under 40 for PhD. HSK (Chinese) or English proficiency may be required."
            ),
            "application_url": "https://www.campuschina.org/scholarships/index.html",
            "source_url": response.url,
            "source_name": self.name,
        })
