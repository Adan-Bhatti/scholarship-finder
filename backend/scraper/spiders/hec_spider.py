import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider


class HECSpider(BaseScholarshipSpider):
    """Scraper for HEC Pakistan scholarships."""

    name = "hec"
    allowed_domains = ["hec.gov.pk"]
    start_urls = ["https://www.hec.gov.pk/english/scholarships/Pages/HEC-Scholarships.aspx"]

    def parse(self, response):
        # Extract scholarship links from HEC listing page
        scholarship_links = response.css("a[href*='scholarship']::attr(href)").getall()

        # Yield the main HEC Need-Based Scholarship entry
        yield self.normalize_item({
            "title": "HEC Need-Based Scholarship",
            "provider": "Higher Education Commission Pakistan",
            "amount_min": 500,
            "amount_max": 2000,
            "currency": "PKR",
            "deadline_text": "September - October (semester-based)",
            "renewable": True,
            "degree_levels": ["Undergraduate", "Master's"],
            "fields_of_study": ["Any"],
            "eligible_nationalities": ["Pakistani"],
            "eligible_countries": ["Pakistan"],
            "gpa_requirement": 2.5,
            "description": (
                "The HEC Need-Based Scholarship provides financial assistance to deserving "
                "students enrolled in HEC-recognized universities in Pakistan. The scholarship "
                "covers tuition, accommodation and living expenses."
            ),
            "eligibility_text": (
                "Pakistani nationals only. Must be enrolled full-time in an HEC-recognized institution. "
                "Family income should not exceed PKR 45,000 per month. Minimum CGPA of 2.5 required."
            ),
            "application_url": "https://www.hec.gov.pk/english/scholarships/Pages/HEC-Scholarships.aspx",
            "source_url": response.url,
            "source_name": self.name,
        })

        # Follow individual scholarship links
        for link in scholarship_links[:5]:  # Limit to avoid crawling entire site
            if link.startswith("http"):
                yield scrapy.Request(link, callback=self.parse_detail)
            else:
                yield response.follow(link, callback=self.parse_detail)

    def parse_detail(self, response):
        title = response.css("h1::text, .page-title::text").get(default="HEC Scholarship").strip()
        description_parts = response.css(".content-body p::text, main p::text").getall()
        description = " ".join(description_parts[:3]).strip()

        if title and description:
            yield self.normalize_item({
                "title": title,
                "provider": "Higher Education Commission Pakistan",
                "degree_levels": ["Undergraduate", "Master's", "PhD"],
                "fields_of_study": ["Any"],
                "eligible_nationalities": ["Pakistani"],
                "eligible_countries": ["Pakistan"],
                "description": description,
                "application_url": response.url,
                "source_url": response.url,
                "source_name": self.name,
            })
