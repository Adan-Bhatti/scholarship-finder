from fastapi.testclient import TestClient

def test_register_user(client: TestClient):
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "StrongPassword123!"
    })
    assert response.status_code == 200
    assert "email" in response.json()
    assert response.json()["email"] == "test@example.com"

def test_login_user(client: TestClient):
    # Register first
    client.post("/auth/register", json={
        "email": "login@example.com",
        "password": "StrongPassword123!"
    })
    
    # Then login
    response = client.post("/auth/login", data={
        "username": "login@example.com",
        "password": "StrongPassword123!"
    })
    
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_register_password_complexity(client: TestClient):
    # Too short
    response = client.post("/auth/register", json={
        "email": "short@example.com",
        "password": "Pass1!"
    })
    assert response.status_code == 400
    assert "ValidationError" in response.json()["error"]
    assert "at least 8 characters" in response.json()["detail"]

    # No uppercase
    response = client.post("/auth/register", json={
        "email": "noupper@example.com",
        "password": "pass123!"
    })
    assert response.status_code == 400
    assert "ValidationError" in response.json()["error"]
    assert "uppercase letter" in response.json()["detail"]

    # No lowercase
    response = client.post("/auth/register", json={
        "email": "nolower@example.com",
        "password": "PASS123!"
    })
    assert response.status_code == 400
    assert "ValidationError" in response.json()["error"]
    assert "lowercase letter" in response.json()["detail"]

    # No number
    response = client.post("/auth/register", json={
        "email": "nonumber@example.com",
        "password": "Password!"
    })
    assert response.status_code == 400
    assert "ValidationError" in response.json()["error"]
    assert "number" in response.json()["detail"]

    # No special character
    response = client.post("/auth/register", json={
        "email": "nospecial@example.com",
        "password": "Password123"
    })
    assert response.status_code == 400
    assert "ValidationError" in response.json()["error"]
    assert "special character" in response.json()["detail"]

    # Strong password - should pass
    response = client.post("/auth/register", json={
        "email": "strong@example.com",
        "password": "StrongPassword123!"
    })
    assert response.status_code == 200

