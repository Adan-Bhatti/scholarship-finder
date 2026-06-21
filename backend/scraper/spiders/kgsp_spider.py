import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class KGSPSpider(BaseScholarshipSpider):
    """Korean Government Scholarship Program (GKS/KGSP) for international students."""

    name = "kgsp"
    allowed_domains = ["studyinkorea.go.kr", "niied.go.kr"]
    start_urls = ["https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do"]

    def parse(self, response):
        deadline_text = response.css("time::text, .date::text").get(default="")
        desc_parts = response.css("main p::text, .board-content p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "Korean Government Scholarship Program (KGSP/GKS)",
            "provider": "National Institute for International Education (NIIED), South Korea",
            "amount_min": 900000,
            "amount_max": 1200000,
            "currency": "KRW",
            "deadline_text": deadline_text or "February - April (Embassy Track) / March (University Track)",
            "renewable": True,
            "degree_levels": ["Undergraduate", "Master's", "PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["Any"],
            "eligible_countries": ["South Korea"],
            "description": description or (
                "The Global Korea Scholarship (GKS), formerly KGSP, is a South Korean government "
                "scholarship program providing full financial support for international students to "
                "study at Korean universities. Covers tuition, living expenses, airfare, and Korean language training."
            ),
            "eligibility_text": (
                "Must be a citizen of a country with diplomatic relations with South Korea "
                "(Korean nationals ineligible). Age limit: under 25 for undergraduate, under 40 for graduate. "
                "Must maintain GPA of 80% or higher. Korean or English language required."
            ),
            "application_url": "https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do",
            "source_url": response.url,
            "source_name": self.name,
        })
