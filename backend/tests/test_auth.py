from fastapi.testclient import TestClient

def test_register_user(client: TestClient):
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "strongpassword123"
    })
    assert response.status_code == 200
    assert "email" in response.json()
    assert response.json()["email"] == "test@example.com"

def test_login_user(client: TestClient):
    # Register first
    client.post("/auth/register", json={
        "email": "login@example.com",
        "password": "strongpassword123"
    })
    
    # Then login
    response = client.post("/auth/login", data={
        "username": "login@example.com",
        "password": "strongpassword123"
    })
    
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
