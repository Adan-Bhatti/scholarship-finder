from fastapi.testclient import TestClient

def test_save_scholarship(client: TestClient):
    # Try to save without auth
    response = client.post("/scholarships/123e4567-e89b-12d3-a456-426614174000/save")
    assert response.status_code == 401

def test_get_saved_scholarships(client: TestClient):
    # Try to get saved scholarships without auth
    response = client.get("/scholarships/saved")
    assert response.status_code == 401

def test_update_saved_status(client: TestClient):
    # Try to update status without auth
    response = client.patch(
        "/scholarships/123e4567-e89b-12d3-a456-426614174000/saved",
        json={"status": "Submitted"}
    )
    assert response.status_code == 401
