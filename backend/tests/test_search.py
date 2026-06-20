from fastapi.testclient import TestClient

def test_search_scholarships(client: TestClient):
    # First login to get token
    client.post("/auth/register", json={
        "email": "search_test@example.com",
        "password": "strongpassword123"
    })
    
    login_res = client.post("/auth/login", data={
        "username": "search_test@example.com",
        "password": "strongpassword123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test search endpoint
    response = client.get("/scholarships/search?q=test", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "data" in data
    assert "page" in data
