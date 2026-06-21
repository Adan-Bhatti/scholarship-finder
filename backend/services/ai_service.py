import json
import logging
from typing import Dict, Any
from backend.core.config import settings
from backend.models.profile import Profile
from backend.models.scholarship import Scholarship



import httpx

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY

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
        Calls the Groq completions API using llama-3.1-8b-instant to generate a personalized explanation 
        of why a user matches a scholarship, along with an action plan.
        """
        if not self.api_key:
            logger.warning("Groq API key not set. Returning mock explanation.")
            return {
                "explanation": "AI explanations are currently disabled. Please configure your GROQ_API_KEY.",
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

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": "You are a helpful API that returns strictly formatted JSON."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        try:
            response = httpx.post(url, json=payload, headers=headers, timeout=15.0)
            if response.status_code == 401:
                logger.error("Groq API key is invalid or has been revoked. Please generate a new key at https://console.groq.com/")
                return {
                    "explanation": "AI explanations are unavailable: the Groq API key is invalid or has been revoked. Please update GROQ_API_KEY in backend/.env with a fresh key from https://console.groq.com/",
                    "checklist": [
                        "Visit the official scholarship website for full eligibility criteria.",
                        "Ensure your GPA meets their minimum requirements.",
                        "Prepare your transcripts and recommendation letters.",
                        "Check application deadlines on the scholarship portal.",
                    ]
                }
            if response.status_code != 200:
                logger.error(f"Groq API returned status code {response.status_code}: {response.text}")
                return {"explanation": "Failed to generate explanation from AI provider.", "checklist": []}
            
            result_text = response.json()["choices"][0]["message"]["content"]
            data = json.loads(result_text)
            return data
            
        except httpx.HTTPError as e:
            logger.error(f"Groq HTTP Error: {str(e)}")
            return {"explanation": "Failed to connect to AI provider.", "checklist": []}
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Groq response as JSON: {result_text}")
            return {"explanation": "AI returned malformed data.", "checklist": []}
        except Exception as e:
            logger.error(f"Unexpected AI error: {str(e)}")
            return {"explanation": "An unexpected error occurred during AI analysis.", "checklist": []}

ai_service = AIService()
