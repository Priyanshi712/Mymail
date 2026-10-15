import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "MyMail"
    assert data["status"] == "operational"


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "MyMail"


def test_signup_success():
    payload = {
        "full_name": "Sarah Connor",
        "email": "sarah.connor@example.com",
        "password": "Password123",
        "confirm_password": "Password123",
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "sarah.connor@example.com"
    assert data["user"]["full_name"] == "Sarah Connor"


def test_signup_password_mismatch():
    payload = {
        "full_name": "Mismatched User",
        "email": "mismatch@example.com",
        "password": "Password123",
        "confirm_password": "DifferentPassword123",
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 422


def test_signup_password_too_weak():
    payload = {
        "full_name": "Weak User",
        "email": "weak@example.com",
        "password": "simple",
        "confirm_password": "simple",
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 422


def test_signup_duplicate_email():
    payload = {
        "full_name": "Duplicate User",
        "email": "sarah.connor@example.com",
        "password": "Password123",
        "confirm_password": "Password123",
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_demo_user():
    response = client.post(
        "/api/auth/login",
        json={"email": "demo@mymail.ai", "password": "Password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@mymail.ai"


def test_login_invalid_password():
    response = client.post(
        "/api/auth/login",
        json={"email": "demo@mymail.ai", "password": "WrongPassword"}
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_get_current_user_profile():
    # Login first
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "demo@mymail.ai", "password": "Password123"}
    )
    token = login_resp.json()["access_token"]
    
    # Get me
    me_resp = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    user = me_resp.json()
    assert user["email"] == "demo@mymail.ai"
    assert user["full_name"] == "Demo Professional"


def test_get_current_user_unauthorized():
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_forgot_and_reset_password_flow():
    # Request reset
    forgot_resp = client.post(
        "/api/auth/forgot-password",
        json={"email": "demo@mymail.ai"}
    )
    assert forgot_resp.status_code == 200
    msg = forgot_resp.json()["message"]
    assert "Dev Token:" in msg
    token = msg.split("Dev Token: ")[1].rstrip(")")

    # Reset password
    reset_resp = client.post(
        "/api/auth/reset-password",
        json={
            "token": token,
            "new_password": "NewSecretPassword999",
            "confirm_new_password": "NewSecretPassword999",
        }
    )
    assert reset_resp.status_code == 200

    # Verify login works with new password
    new_login = client.post(
        "/api/auth/login",
        json={"email": "demo@mymail.ai", "password": "NewSecretPassword999"}
    )
    assert new_login.status_code == 200


def test_github_oauth_url_generation():
    response = client.get("/api/auth/oauth/github/url")
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert "state" in data
    assert data["provider"] == "github"
    assert len(data["state"]) > 10


def test_github_oauth_callback_invalid_state():
    response = client.post(
        "/api/auth/oauth/github/callback",
        json={"code": "sample_code", "state": "forged_state_token"}
    )
    assert response.status_code == 400
    assert "anti-CSRF" in response.json()["detail"]


def test_github_oauth_callback_success():
    # 1. Fetch valid state
    url_resp = client.get("/api/auth/oauth/github/url")
    state = url_resp.json()["state"]

    # 2. Callback with valid state
    cb_resp = client.post(
        "/api/auth/oauth/github/callback",
        json={"code": "valid_github_code", "state": state}
    )
    assert cb_resp.status_code == 200
    data = cb_resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "priyanshi" in data["user"]["email"]

