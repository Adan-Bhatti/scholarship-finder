import re
from typing import List

def extract_degree_levels(text: str) -> List[str]:
    levels = []
    text_lower = text.lower()
    
    if "high school" in text_lower:
        levels.append("High School")
    if "undergraduate" in text_lower or "bachelor" in text_lower:
        levels.append("Undergraduate")
    if "master" in text_lower or "postgraduate" in text_lower:
        levels.append("Master's")
    if "phd" in text_lower or "doctoral" in text_lower:
        levels.append("PhD")
        
    return levels

def extract_gpa_requirement(text: str) -> float | None:
    match = re.search(r'gpa\s*(?:of\s*)?(?:at\s*least\s*)?(\d\.\d)', text, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return None
