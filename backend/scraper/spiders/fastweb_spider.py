import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider

class FastwebSpider(BaseScholarshipSpider):
    name = "fastweb"
    allowed_domains = ["fastweb.com"]
    start_urls = ["https://www.fastweb.com/college-scholarships/articles"]

    def parse(self, response):
        # Look for article links to extract
        articles = response.css('a[href*="/college-scholarships/articles/"]')
        
        for article in articles:
            title_text = article.css('::text').get()
            if not title_text:
                continue
            title_text = title_text.strip()
            
            # Skip generic links like "Scholarships" or short texts
            if title_text.lower() == "scholarships" or len(title_text) < 10:
                continue
                
            href = article.attrib.get('href')
            full_url = response.urljoin(href)
                
            raw_data = {
                "title": title_text,
                "provider": "Fastweb (Public Directory)",
                "description": f"Found via Fastweb article directory: {title_text}",
                "amount_min": 1000, # Estimated
                "amount_max": 5000,
                "currency": "USD",
                "deadline_text": "Varies",
                "source_url": full_url,
                "degree_levels": ["Bachelors", "High School"],
                "fields_of_study": ["Any"],
                "eligible_nationalities": ["Any"],
                "eligible_countries": ["USA"]
            }
            yield self.normalize_item(raw_data)
