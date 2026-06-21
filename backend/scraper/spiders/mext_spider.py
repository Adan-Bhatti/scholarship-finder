import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class MEXTSpider(BaseScholarshipSpider):
    """Japanese Government (MEXT) Scholarship for international students."""

    name = "mext"
    allowed_domains = ["studyinjapan.go.jp", "mext.go.jp"]
    start_urls = ["https://www.studyinjapan.go.jp/en/planning/scholarship/"]

    def parse(self, response):
        deadline_text = response.css("time::text, .deadline::text").get(default="")
        desc_parts = response.css("main p::text, .content p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "MEXT Japanese Government Scholarship",
            "provider": "Ministry of Education, Culture, Sports, Science and Technology (Japan)",
            "amount_min": 117000,
            "amount_max": 145000,
            "currency": "JPY",
            "deadline_text": deadline_text or "May - June (via Japanese Embassy in your country)",
            "renewable": True,
            "degree_levels": ["Undergraduate", "Master's", "PhD"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["Any"],
            "eligible_countries": ["Japan"],
            "description": description or (
                "The Japanese Government (MEXT) Scholarship is awarded to international students "
                "who wish to study at Japanese universities as research students, undergraduate "
                "students, or students in specialized training colleges."
            ),
            "eligibility_text": (
                "Must be a citizen of a country that has diplomatic relations with Japan. "
                "Age limits apply (generally under 35 for research students). "
                "Must have completed 12 years of school education. Japanese or English proficiency required."
            ),
            "application_url": "https://www.studyinjapan.go.jp/en/planning/scholarship/",
            "source_url": response.url,
            "source_name": self.name,
        })
