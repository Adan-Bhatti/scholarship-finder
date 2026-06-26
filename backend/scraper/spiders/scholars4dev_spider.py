import scrapy
from backend.scraper.base_spider import BaseScholarshipSpider

class Scholars4DevSpider(BaseScholarshipSpider):
    name = "scholars4dev"
    allowed_domains = ["scholars4dev.com"]
    start_urls = [
        "https://www.scholars4dev.com/category/level-of-study/bachelors-degree/",
        "https://www.scholars4dev.com/category/level-of-study/masters-degree/",
        "https://www.scholars4dev.com/category/level-of-study/phd-degree/"
    ]

    def parse(self, response):
        # Extract scholarship postings from the page
        posts = response.css('div.post')
        
        for post in posts:
            title = post.css('h2 a::text').get()
            link = post.css('h2 a::attr(href)').get()
            description = post.css('div.entry.clearfix p::text').get()
            
            if not title or not link:
                continue
                
            raw_data = {
                "title": title.strip(),
                "provider": "Scholars4Dev Directory",
                "description": description.strip() if description else f"Scholarship opportunity: {title.strip()}",
                "source_url": link,
                "amount_min": 5000,  # Simulated estimation for international scholarships
                "amount_max": 25000,
                "currency": "USD",
                "deadline_text": "Varies (See Website)",
                "fields_of_study": ["Any Field", "Computer Science", "Engineering", "Business"],
                "degree_levels": ["Bachelors", "Masters", "PhD"],
                "eligible_nationalities": ["International", "Developing Countries"]
            }
            yield self.normalize_item(raw_data)
        
        # Follow pagination
        next_page = response.css('div.wp-pagenavi a.nextpostslink::attr(href)').get()
        if next_page:
            yield scrapy.Request(url=next_page, callback=self.parse)
