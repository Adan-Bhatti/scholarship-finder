import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class KAUSTSpider(BaseScholarshipSpider):
    """Scraper for KAUST (King Abdullah University of Science and Technology) Fellowship."""

    name = "kaust"
    allowed_domains = ["kaust.edu.sa"]
    start_urls = ["https://www.kaust.edu.sa/en/study/applying-to-kaust/financial-support"]

    def parse(self, response):
        deadline_text = response.css(".deadline, time::text").get(default="")
        desc_parts = response.css("main p::text, .page-content p::text").getall()
        description = " ".join(desc_parts[:3]).strip()

        yield self.normalize_item({
            "title": "KAUST Fellowship (MS/PhD)",
            "provider": "King Abdullah University of Science and Technology",
            "amount_min": 25000,
            "amount_max": 35000,
            "currency": "USD",
            "deadline_text": deadline_text or "January 15 (Spring) / May 15 (Fall)",
            "renewable": True,
            "degree_levels": ["Master's", "PhD"],
            "fields_of_study": [
                "Computer Science", "Engineering", "Science", "Mathematics",
                "Environmental Science", "Bioscience"
            ],
            "eligible_nationalities": ["Any"],
            "eligible_countries": ["Saudi Arabia"],
            "gpa_requirement": 3.5,
            "description": description or (
                "KAUST offers a fully funded fellowship covering tuition, housing, medical insurance, "
                "and a living allowance for graduate students in STEM fields. All instruction is "
                "in English and KAUST is open to international students."
            ),
            "eligibility_text": (
                "Open to international students. Must hold a relevant Bachelor's or Master's degree. "
                "Strong quantitative background required. TOEFL or IELTS may be required. "
                "No tuition fees — full funding provided."
            ),
            "application_url": "https://www.kaust.edu.sa/en/study/applying-to-kaust",
            "source_url": response.url,
            "source_name": self.name,
        })
