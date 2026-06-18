from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

def test_explain_unauthorized(client: TestClient):
    response = client.get("/match/explain/123e4567-e89b-12d3-a456-426614174000")
    assert response.status_code == 401

@patch("backend.services.ai_service.ai_service.generate_eligibility_explanation")
def test_explain_profile_not_found(mock_ai, client: TestClient, db):
    # If the user is authenticated but has no profile
    # For now, just a stub
    pass

@patch("backend.services.ai_service.ai_service.generate_eligibility_explanation")
def test_explain_success(mock_ai, client: TestClient, db):
    # Mocking the AI service to avoid real API calls during tests
    mock_ai.return_value = {
        "explanation": "You are a great match.",
        "checklist": ["Apply soon"]
    }
    pass
