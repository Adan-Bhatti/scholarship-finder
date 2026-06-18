from dateutil import parser
from datetime import datetime
from typing import Optional

def parse_deadline(text: str) -> Optional[datetime]:
    """
    Converts a human readable string like 'March 31, 2026' to a datetime object.
    Returns None if parsing fails.
    """
    if not text or "varies" in text.lower() or "rolling" in text.lower():
        return None
        
    try:
        # fuzzy=True ignores text like "Deadline: "
        dt = parser.parse(text, fuzzy=True)
        return dt
    except Exception:
        return None
