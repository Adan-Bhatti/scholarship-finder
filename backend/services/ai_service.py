import json
import logging
from functools import lru_cache
from typing import Dict, Any
from backend.core.config import settings
from backend.models.profile import Profile
from backend.models.scholarship import Scholarship



import httpx

logger = logging.getLogger(__name__)

# Simple in-memory cache: key = (scholarship_id, profile_gpa, profile_nationality, profile_degree)
_AI_CACHE: Dict[tuple, Dict[str, Any]] = {}

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
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are a helpful API that returns strictly formatted JSON."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        # Check cache first
        cache_key = (str(scholarship.id), profile.gpa, profile.nationality, profile.degree_level)
        if cache_key in _AI_CACHE:
            logger.info(f"AI cache hit for scholarship {scholarship.id}")
            return _AI_CACHE[cache_key]

        try:
            response = httpx.post(url, json=payload, headers=headers, timeout=30.0)
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
            # Store in cache
            _AI_CACHE[cache_key] = data
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

    def chat(self, query: str, profile: Profile, scholarships: list[Scholarship]) -> str:
        """
        RAG Chatbot logic: Given a user's query, profile, and top N matched scholarships,
        generates an answer.
        """
        if not self.api_key:
            return "AI Chat is currently disabled. Please configure your GROQ_API_KEY."

        context = ""
        for idx, s in enumerate(scholarships, 1):
            context += f"\n[{idx}] {s.title} by {s.provider} (Amount: {s.currency} {s.amount_max or 'N/A'})\n"
            context += f"Description: {s.description}\n"

        prompt = f"""
        You are ScholarshipAI, a helpful and encouraging scholarship advisor assistant.
        
        User's Profile:
        {self._format_profile(profile)}
        
        Available Scholarships Context:
        {context}

        User's Question:
        {query}

        Provide a concise, helpful answer to the user's question. Refer to the scholarships in the context if relevant.
        """

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are a helpful scholarship advisor assistant."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.5
        }

        try:
            response = httpx.post(url, json=payload, headers=headers, timeout=30.0)
            if response.status_code == 401:
                return "The Groq API key is invalid or revoked. Please update the API key."
            if response.status_code != 200:
                return "I'm sorry, I couldn't process your request right now."
            
            return response.json()["choices"][0]["message"]["content"]
            
        except Exception as e:
            logger.error(f"Chat error: {str(e)}")
            return "An unexpected error occurred."

    def parse_resume(self, resume_text: str) -> Dict[str, Any]:
        """
        Parses raw resume text and extracts profile-relevant fields like degree_level, 
        field_of_study, gpa, and extracurriculars.
        """
        if not self.api_key:
            return {}

        prompt = f"""
        You are an expert resume parser. Extract the following information from the resume text provided below.
        Return ONLY a JSON object with these keys (use null or empty array if not found):
        - degree_level (string: "High School", "Bachelors", "Masters", "PhD", or null)
        - field_of_study (string, e.g., "Computer Science", or null)
        - gpa (float, e.g. 3.8, or null)
        - extracurriculars (array of strings, e.g. ["Debate Club", "Varsity Soccer"], or [])
        - graduation_year (integer, e.g. 2024, or null)
        - target_destinations (array of strings, typically inferred from languages/certifications or just [])
        
        Resume Text:
        {resume_text}
        """

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are a helpful API that returns strictly formatted JSON."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1
        }

        try:
            response = httpx.post(url, json=payload, headers=headers, timeout=30.0)
            if response.status_code == 200:
                result_text = response.json()["choices"][0]["message"]["content"]
                return json.loads(result_text)
            return {}
        except Exception as e:
            logger.error(f"Resume parsing error: {str(e)}")
            return {}

ai_service = AIService()
