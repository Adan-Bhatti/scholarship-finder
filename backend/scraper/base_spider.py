import scrapy
from datetime import datetime
from typing import Dict, Any

from scraper.items import ScholarshipItem
from scraper.parsers.amount_parser import parse_amount
from scraper.parsers.deadline_parser import parse_deadline

class BaseScholarshipSpider(scrapy.Spider):
    """
    Abstract base spider that handles normalization before yielding the item.
    """
    
    def normalize_item(self, raw_data: Dict[str, Any]) -> ScholarshipItem:
        item = ScholarshipItem()
        
        item['title'] = raw_data.get('title', '').strip()
        item['provider'] = raw_data.get('provider', '').strip()
        item['description'] = raw_data.get('description', '').strip()
        item['source_url'] = raw_data.get('source_url', '')
        item['source_name'] = getattr(self, 'name', 'unknown')
        item['application_url'] = raw_data.get('application_url', item['source_url'])
        
        # Amount parsing
        amount_text = raw_data.get('amount_text', '')
        min_amt, max_amt = parse_amount(amount_text)
        item['amount_min'] = min_amt
        item['amount_max'] = max_amt
        item['currency'] = "USD"
        
        # Deadline parsing
        deadline_text = raw_data.get('deadline_text', '')
        item['deadline'] = parse_deadline(deadline_text)
        
        # Defaults for structured data arrays
        item['degree_levels'] = raw_data.get('degree_levels', [])
        item['fields_of_study'] = raw_data.get('fields_of_study', [])
        item['eligible_nationalities'] = raw_data.get('eligible_nationalities', [])
        item['eligible_countries'] = raw_data.get('eligible_countries', [])
        item['requirements'] = raw_data.get('requirements', [])
        
        return item
