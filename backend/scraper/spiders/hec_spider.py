from backend.scraper.base_spider import BaseScholarshipSpider

class HecSpider(BaseScholarshipSpider):
    name = "hec"
    allowed_domains = ["hec.gov.pk"]
    start_urls = ["https://www.hec.gov.pk/english/scholarshipsgrants/"]

    def parse(self, response):
        # NOTE: Dry-run implementation
        raw_data = {
            "title": "HEC Overseas Scholarship",
            "provider": "Higher Education Commission (HEC)",
            "description": "Scholarship for MS/MPhil leading to PhD in selected fields.",
            "amount_text": "Full Tuition + Stipend",
            "deadline_text": "June 30, 2026",
            "source_url": response.url,
            "degree_levels": ["Master's", "PhD"],
            "eligible_nationalities": ["Pakistani"],
            "target_destinations": ["United Kingdom", "USA", "Australia"]
        }
        
        yield self.normalize_item(raw_data)
