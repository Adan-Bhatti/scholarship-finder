import json
import logging
from typing import Dict, Any
from backend.core.config import settings
from backend.models.profile import Profile
from backend.models.scholarship import Scholarship

# We only import anthropic if we need it to avoid hard crashes if the library isn't installed
try:
    from anthropic import Anthropic
    import anthropic
except ImportError:
    Anthropic = None

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.client = Anthropic(api_key=self.api_key) if Anthropic and self.api_key else None

    def _format_profile(self, profile: Profile) -> str:
        return f"""
        Degree Level: {profile.degree_level}
        Field of Study: {profile.field_of_study}
        GPA: {profile.gpa}
        Nationality: {profile.nationality}
        Country of Residence: {profile.country_of_residence}
        Target Destinations: {', '.join(profile.target_destinations) if profile.target_destinations else 'None'}
        """

    def _format_scholarship(self, scholarship: Scholarship) -> str:
        return f"""
        Title: {scholarship.title}
        Provider: {scholarship.provider}
        Degree Levels: {', '.join(scholarship.degree_levels) if scholarship.degree_levels else 'Any'}
        Fields of Study: {', '.join(scholarship.fields_of_study) if scholarship.fields_of_study else 'Any'}
        Eligible Nationalities: {', '.join(scholarship.eligible_nationalities) if scholarship.eligible_nationalities else 'Any'}
        Eligible Countries: {', '.join(scholarship.eligible_countries) if scholarship.eligible_countries else 'Any'}
        GPA Requirement: {scholarship.gpa_requirement or 'None'}
        Description: {scholarship.description}
        Eligibility Text: {scholarship.eligibility_text}
        """

    def generate_eligibility_explanation(self, profile: Profile, scholarship: Scholarship) -> Dict[str, Any]:
        """
        Calls the Anthropic Claude API to generate a personalized explanation 
        of why a user matches a scholarship, along with an action plan.
        """
        if not self.client:
            logger.warning("Anthropic API key not set or anthropic library missing. Returning mock explanation.")
            return {
                "explanation": "AI explanations are currently disabled. Please configure your ANTHROPIC_API_KEY.",
                "checklist": [
                    "Check the official website for full eligibility criteria.",
                    "Ensure your GPA meets their minimum requirements.",
                    "Prepare your transcripts and recommendation letters."
                ]
            }

        prompt = f"""
        You are an expert scholarship advisor. 

        Given the following Student Profile:
        {self._format_profile(profile)}

        And the following Scholarship details:
        {self._format_scholarship(scholarship)}

        Generate a clear, personalized assessment in JSON format with exactly two keys:
        1. "explanation": A 2-3 sentence paragraph explaining why this student is a good fit, or highlighting any criteria they might be missing.
        2. "checklist": An array of 3-5 actionable steps the student should take to apply for this specific scholarship.

        Respond ONLY with valid JSON.
        """

        try:
            response = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=500,
                temperature=0.2,
                system="You are a helpful API that returns strictly formatted JSON.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # The response content might contain markdown code blocks around the JSON
            result_text = response.content[0].text
            # Simple cleanup in case it wraps in ```json
            result_text = result_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            
            data = json.loads(result_text)
            return data
            
        except anthropic.APIError as e:
            logger.error(f"Anthropic API Error: {str(e)}")
            return {"explanation": "Failed to connect to AI provider.", "checklist": []}
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {result_text}")
            return {"explanation": "AI returned malformed data.", "checklist": []}
        except Exception as e:
            logger.error(f"Unexpected AI error: {str(e)}")
            return {"explanation": "An unexpected error occurred during AI analysis.", "checklist": []}

ai_service = AIService()
