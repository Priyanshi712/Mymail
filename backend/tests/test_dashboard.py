import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.services.auth_service import user_store
from app.models.auth import UserCreate

client = TestClient(app)


@pytest.fixture
def auth_headers():
    # Ensure test user exists
    user_email = "dash_test@example.com"
    existing = user_store.get_by_email(user_email)
    if not existing:
        user = user_store.create(
            UserCreate(
                email=user_email,
                full_name="Dashboard Tester",
                password="SecurePassword123!",
                confirm_password="SecurePassword123!",
            )
        )
    else:
        user = existing

    token = create_access_token(subject=user["id"])
    return {"Authorization": f"Bearer {token}"}


def test_dashboard_overview_unauthorized():
    response = client.get("/api/dashboard/overview")
    assert response.status_code == 401


def test_dashboard_overview_authorized(auth_headers):
    response = client.get("/api/dashboard/overview", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    # Check metrics
    assert "metrics" in data
    metrics = data["metrics"]
    assert metrics["total_unread"] >= 0
    assert metrics["needs_reply_count"] >= 0
    assert metrics["ai_summaries_count"] == 8
    assert metrics["followups_due_today"] == 3
    assert 0.0 <= metrics["inbox_zero_percentage"] <= 100.0
    assert metrics["safe_send_active"] is True

    # Check priority queue
    assert "priority_queue" in data
    assert len(data["priority_queue"]) > 0
    first_item = data["priority_queue"][0]
    assert "sender_name" in first_item
    assert "subject" in first_item
    assert "urgency" in first_item

    # Check recent activity
    assert "recent_activity" in data
    assert len(data["recent_activity"]) > 0


def test_triage_thread_resolve(auth_headers):
    response = client.post(
        "/api/dashboard/triage/t1",
        json={"action": "resolve"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["thread_id"] == "t1"
    assert "marked as resolved" in data["message"]
    assert data["updated_metrics"]["needs_reply_count"] <= 3


def test_triage_thread_snooze(auth_headers):
    response = client.post(
        "/api/dashboard/triage/t2",
        json={"action": "snooze"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["thread_id"] == "t2"
    assert "snoozed" in data["message"]


def test_triage_thread_not_found(auth_headers):
    response = client.post(
        "/api/dashboard/triage/nonexistent-id",
        json={"action": "resolve"},
        headers=auth_headers,
    )
    assert response.status_code == 404
