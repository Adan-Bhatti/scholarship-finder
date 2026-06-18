import scrapy

class ScholarshipItem(scrapy.Item):
    title = scrapy.Field()
    provider = scrapy.Field()
    
    amount_min = scrapy.Field()
    amount_max = scrapy.Field()
    currency = scrapy.Field()
    
    deadline = scrapy.Field()
    renewable = scrapy.Field()
    
    degree_levels = scrapy.Field()
    fields_of_study = scrapy.Field()
    eligible_nationalities = scrapy.Field()
    eligible_countries = scrapy.Field()
    
    gpa_requirement = scrapy.Field()
    income_requirement = scrapy.Field()
    
    description = scrapy.Field()
    eligibility_text = scrapy.Field()
    requirements = scrapy.Field()
    benefits = scrapy.Field()
    
    application_url = scrapy.Field()
    source_url = scrapy.Field()
    source_name = scrapy.Field()
