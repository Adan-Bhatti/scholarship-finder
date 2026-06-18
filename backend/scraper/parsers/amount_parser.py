import re
from typing import Optional, Tuple

def parse_amount(text: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Parses strings like "$5,000" or "$1000 - $5000" into (min_amount, max_amount).
    """
    if not text:
        return None, None
        
    text = text.replace(",", "")
    amounts = re.findall(r'\d+\.?\d*', text)
    
    if not amounts:
        return None, None
        
    if len(amounts) == 1:
        val = float(amounts[0])
        return val, val
        
    val1, val2 = float(amounts[0]), float(amounts[1])
    return min(val1, val2), max(val1, val2)
