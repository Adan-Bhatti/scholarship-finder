from fastapi.testclient import TestClient

def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "scholarship-finder-api"}

def test_auth_unauthorized(client: TestClient):
    # Attempting to get matches without a valid token should return 401
    response = client.get("/scholarships/matches")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]
