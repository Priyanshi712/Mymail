import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.services.auth_service import user_store
from app.models.auth import UserCreate

client = TestClient(app)


@pytest.fixture
def auth_headers():
    user_email = "provider_test@example.com"
    existing = user_store.get_by_email(user_email)
    if not existing:
        user = user_store.create(
            UserCreate(
                email=user_email,
                full_name="Provider Tester",
                password="SecurePassword123!",
                confirm_password="SecurePassword123!",
            )
        )
    else:
        user = existing

    token = create_access_token(subject=user["id"])
    return {"Authorization": f"Bearer {token}"}


def test_get_providers_public():
    response = client.get("/api/email/providers")
    assert response.status_code == 200
    data = response.json()
    assert "providers" in data
    providers = data["providers"]
    provider_keys = [p["provider"] for p in providers]
    assert "google" in provider_keys
    assert "microsoft" in provider_keys

    # Check Google provider details
    google = next(p for p in providers if p["provider"] == "google")
    assert google["display_name"] == "Google Gmail"
    assert any("gmail.readonly" in s for s in google["scopes"])
    assert any("gmail.send" in s for s in google["scopes"])

    # Check Microsoft provider details
    ms = next(p for p in providers if p["provider"] == "microsoft")
    assert ms["display_name"] == "Microsoft Outlook"
    assert "Mail.Read" in ms["scopes"]


def test_oauth_url_unauthorized():
    response = client.get("/api/email/oauth/google/url")
    assert response.status_code == 401


def test_oauth_url_invalid_provider(auth_headers):
    response = client.get("/api/email/oauth/yahoo_unknown/url", headers=auth_headers)
    assert response.status_code == 400
    assert "Unsupported email provider" in response.json()["detail"]


def test_oauth_url_google_success(auth_headers):
    response = client.get("/api/email/oauth/google/url", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert "state" in data
    assert data["provider"] == "google"
    assert len(data["state"]) > 10


def test_oauth_url_outlook_success(auth_headers):
    response = client.get("/api/email/oauth/microsoft/url", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert "state" in data
    assert data["provider"] == "microsoft"


def test_oauth_callback_invalid_state(auth_headers):
    response = client.post(
        "/api/email/oauth/google/callback",
        json={"code": "mock_code", "state": "tampered_csrf_state"},
        headers=auth_headers,
    )
    assert response.status_code == 400
    assert "anti-CSRF" in response.json()["detail"]


def test_oauth_callback_google_success(auth_headers):
    # 1. Fetch valid state
    url_resp = client.get("/api/email/oauth/google/url", headers=auth_headers)
    assert url_resp.status_code == 200
    state = url_resp.json()["state"]

    # 2. Complete callback
    cb_resp = client.post(
        "/api/email/oauth/google/callback",
        json={"code": "sample_auth_code_123", "state": state},
        headers=auth_headers,
    )
    assert cb_resp.status_code == 200
    account = cb_resp.json()
    assert account["provider"] == "google"
    assert "email" in account
    assert account["status"] == "active"
    assert account["is_primary"] is True

    # Security check: tokens MUST NOT be returned in response payload!
    assert "access_token" not in account
    assert "refresh_token" not in account


def test_oauth_callback_outlook_success(auth_headers):
    url_resp = client.get("/api/email/oauth/microsoft/url", headers=auth_headers)
    state = url_resp.json()["state"]

    cb_resp = client.post(
        "/api/email/oauth/microsoft/callback",
        json={"code": "sample_outlook_code_456", "state": state},
        headers=auth_headers,
    )
    assert cb_resp.status_code == 200
    account = cb_resp.json()
    assert account["provider"] == "microsoft"
    assert "outlook" in account["email"] or "priyanshi" in account["email"]
    assert account["status"] == "active"


def test_get_connected_accounts_and_sync(auth_headers):
    # Connect Gmail account first
    url_resp = client.get("/api/email/oauth/google/url", headers=auth_headers)
    state = url_resp.json()["state"]
    client.post(
        "/api/email/oauth/google/callback",
        json={"code": "code_sync_test", "state": state},
        headers=auth_headers,
    )

    # Fetch connected accounts
    accounts_resp = client.get("/api/email/accounts", headers=auth_headers)
    assert accounts_resp.status_code == 200
    accounts = accounts_resp.json()
    assert len(accounts) > 0

    account_id = accounts[0]["id"]

    # Check status
    status_resp = client.get(f"/api/email/accounts/{account_id}/status", headers=auth_headers)
    assert status_resp.status_code == 200
    assert status_resp.json()["id"] == account_id

    # Trigger Sync
    sync_resp = client.post(f"/api/email/accounts/{account_id}/sync", headers=auth_headers)
    assert sync_resp.status_code == 200
    sync_data = sync_resp.json()
    assert sync_data["status"] == "synced"
    assert sync_data["synced_count"] >= 0
    assert "synced_at" in sync_data

    # Fetch preview threads
    threads_resp = client.get(f"/api/email/accounts/{account_id}/threads", headers=auth_headers)
    assert threads_resp.status_code == 200
    threads_data = threads_resp.json()
    assert "threads" in threads_data
    assert threads_data["total"] >= 0


def test_disconnect_and_reconnect_flow(auth_headers):
    # Connect account
    url_resp = client.get("/api/email/oauth/google/url", headers=auth_headers)
    state = url_resp.json()["state"]
    cb_resp = client.post(
        "/api/email/oauth/google/callback",
        json={"code": "code_disconnect_test", "state": state},
        headers=auth_headers,
    )
    account_id = cb_resp.json()["id"]

    # Disconnect
    disc_resp = client.post(f"/api/email/accounts/{account_id}/disconnect", headers=auth_headers)
    assert disc_resp.status_code == 200
    assert disc_resp.json()["success"] is True

    # Status should now be disconnected
    status_resp = client.get(f"/api/email/accounts/{account_id}/status", headers=auth_headers)
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "disconnected"

    # Syncing disconnected mailbox should fail
    sync_fail = client.post(f"/api/email/accounts/{account_id}/sync", headers=auth_headers)
    assert sync_fail.status_code == 400
    assert "disconnected" in sync_fail.json()["detail"]

    # Reconnect
    recon_resp = client.post(f"/api/email/accounts/{account_id}/reconnect", headers=auth_headers)
    assert recon_resp.status_code == 200
    assert recon_resp.json()["status"] == "active"


def test_account_not_found(auth_headers):
    response = client.get("/api/email/accounts/acc_nonexistent_999/status", headers=auth_headers)
    assert response.status_code == 404

