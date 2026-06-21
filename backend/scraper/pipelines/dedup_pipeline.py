from scrapy.exceptions import DropItem

class DedupPipeline:
    def __init__(self):
        self.seen_scholarships = set()

    def process_item(self, item, spider):
        if hasattr(spider, 'normalize_item'):
            item = spider.normalize_item(item)
            
        # Deduplication key based on title and provider
        title = item.get('title', '').lower().strip()
        provider = item.get('provider', '').lower().strip()
        
        if not title or not provider:
            raise DropItem(f"Missing title or provider in {item}")
            
        key = f"{title}::{provider}"
        
        if key in self.seen_scholarships:
            raise DropItem(f"Duplicate scholarship found: {key}")
            
        self.seen_scholarships.add(key)
        return item
