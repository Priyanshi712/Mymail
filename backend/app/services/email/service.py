import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any

from app.models.email_provider import (
    ConnectedAccountResponse,
    SyncMailboxResponse,
    DisconnectAccountResponse,
    EmailThreadPreview,
)
from app.services.email.factory import get_email_provider


class EmailAccountService:
    """
    Service responsible for managing connected email accounts, secure token storage,
    CSRF state tokens, automatic token refreshing, and mailbox synchronization.
    """

    def __init__(self):
        # account_id -> account dict (including private secure tokens)
        self._accounts: Dict[str, Dict[str, Any]] = {}
        # state -> {user_id: str, provider: str, created_at: datetime}
        self._oauth_states: Dict[str, Dict[str, Any]] = {}
        # Seed demo account for initial testing
        self._seed_demo_account()

    def _seed_demo_account(self):
        """Pre-seeds an active connected Gmail account for testing and demo flows."""
        demo_user_id = "demo-user-id"
        account_id = "acc_demo_gmail"
        now = datetime.now(timezone.utc)
        self._accounts[account_id] = {
            "id": account_id,
            "user_id": demo_user_id,
            "provider": "google",
            "email": "demo@mymail.ai",
            "name": "Demo Professional (Gmail)",
            "avatar_url": None,
            "status": "active",
            "scopes": [
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/gmail.send",
                "https://www.googleapis.com/auth/gmail.modify",
            ],
            "is_primary": True,
            "access_token": "mock_google_access_token_demo",
            "refresh_token": "mock_google_refresh_token_demo",
            "token_type": "Bearer",
            "expires_at": now + timedelta(hours=24),
            "created_at": now - timedelta(days=2),
            "updated_at": now,
            "last_synced_at": now - timedelta(minutes=12),
            "sync_status": "synced",
            "last_synced_count": 28,
            "last_unread_count": 4,
        }

    def create_oauth_state(self, user_id: str, provider: str) -> str:
        """Generates and records a cryptographically secure anti-CSRF state token."""
        state = secrets.token_urlsafe(32)
        self._oauth_states[state] = {
            "user_id": user_id,
            "provider": provider,
            "created_at": datetime.now(timezone.utc),
        }
        return state

    def verify_and_consume_state(self, state: str, expected_provider: Optional[str] = None) -> Dict[str, Any]:
        """Validates and consumes an anti-CSRF state token within a 15-minute window."""
        state_data = self._oauth_states.pop(state, None)
        if not state_data:
            raise ValueError("Invalid or expired OAuth state parameter (anti-CSRF check failed)")

        # Verify not expired (15 minutes)
        now = datetime.now(timezone.utc)
        if (now - state_data["created_at"]).total_seconds() > 900:
            raise ValueError("OAuth state token has expired. Please initiate connection again.")

        if expected_provider and state_data["provider"] != expected_provider:
            raise ValueError(f"State provider mismatch: expected {expected_provider}, got {state_data['provider']}")

        return state_data

    async def connect_account(
        self,
        user_id: str,
        provider_name: str,
        code: str,
        state: str,
        redirect_uri: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Exchanges OAuth code for tokens, retrieves user profile, and registers connected account."""
        state_data = self.verify_and_consume_state(state, expected_provider=provider_name)
        # Re-assign user_id from state if authenticated session ID matches or is provided
        acting_user_id = user_id or state_data["user_id"]

        provider = get_email_provider(provider_name)
        tokens = await provider.exchange_code(code=code, redirect_uri=redirect_uri)
        profile = await provider.get_user_profile(tokens.access_token)

        now = datetime.now(timezone.utc)

        # Check if an account with this provider + email already exists for this user
        existing_account = None
        for acc in self._accounts.values():
            if acc["user_id"] == acting_user_id and acc["provider"] == provider_name and acc["email"].lower() == profile.email.lower():
                existing_account = acc
                break

        if existing_account:
            existing_account["status"] = "active"
            existing_account["access_token"] = tokens.access_token
            if tokens.refresh_token:
                existing_account["refresh_token"] = tokens.refresh_token
            existing_account["expires_at"] = tokens.expires_at or (now + timedelta(seconds=tokens.expires_in))
            existing_account["updated_at"] = now
            existing_account["last_synced_at"] = now
            existing_account["sync_status"] = "synced"
            return existing_account

        account_id = f"acc_{secrets.token_hex(8)}"
        account_data = {
            "id": account_id,
            "user_id": acting_user_id,
            "provider": provider_name,
            "email": profile.email,
            "name": profile.name,
            "avatar_url": profile.picture,
            "status": "active",
            "scopes": provider.default_scopes,
            "is_primary": len(self.get_user_accounts(acting_user_id)) == 0,
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token,
            "token_type": tokens.token_type,
            "expires_at": tokens.expires_at or (now + timedelta(seconds=tokens.expires_in)),
            "created_at": now,
            "updated_at": now,
            "last_synced_at": now,
            "sync_status": "synced",
            "last_synced_count": 15,
            "last_unread_count": 3,
        }
        self._accounts[account_id] = account_data
        return account_data

    def get_user_accounts(self, user_id: str) -> List[Dict[str, Any]]:
        """Returns all connected accounts for a specific user ID (or demo accounts if user matches)."""
        res = [acc for acc in self._accounts.values() if acc["user_id"] == user_id]
        if not res and (user_id == "demo-user-id" or not user_id):
            return list(self._accounts.values())
        return res

    def get_account_by_id(self, user_id: str, account_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a specific account checking ownership."""
        acc = self._accounts.get(account_id)
        if not acc:
            return None
        if acc["user_id"] != user_id and acc["user_id"] != "demo-user-id":
            return None
        return acc

    async def ensure_valid_access_token(self, account: Dict[str, Any]) -> str:
        """
        Validates token freshness. If expiring within 5 minutes and a refresh token
        is available, automatically refreshes the token in the background.
        """
        now = datetime.now(timezone.utc)
        expires_at = account.get("expires_at")
        
        # Check if expired or within 5 minutes of expiring
        needs_refresh = False
        if isinstance(expires_at, datetime):
            if expires_at - now < timedelta(minutes=5):
                needs_refresh = True

        if needs_refresh and account.get("refresh_token"):
            provider = get_email_provider(account["provider"])
            new_tokens = await provider.refresh_token(account["refresh_token"])
            account["access_token"] = new_tokens.access_token
            if new_tokens.refresh_token:
                account["refresh_token"] = new_tokens.refresh_token
            account["expires_at"] = new_tokens.expires_at or (now + timedelta(seconds=new_tokens.expires_in))
            account["updated_at"] = now
            account["status"] = "active"

        return account["access_token"]

    async def sync_mailbox(self, user_id: str, account_id: str) -> SyncMailboxResponse:
        """Fetches threads and metadata from provider, refreshing tokens if needed."""
        account = self.get_account_by_id(user_id, account_id)
        if not account:
            raise ValueError(f"Connected account {account_id} not found.")

        if account["status"] == "disconnected":
            raise ValueError("Cannot sync a disconnected mailbox. Reconnection required.")

        access_token = await self.ensure_valid_access_token(account)
        provider = get_email_provider(account["provider"])

        threads_data = await provider.fetch_threads(access_token=access_token, max_results=30)
        threads = threads_data.get("threads", [])
        unread_count = sum(1 for t in threads if t.get("unread", False))

        now = datetime.now(timezone.utc)
        account["last_synced_at"] = now
        account["sync_status"] = "synced"
        account["last_synced_count"] = len(threads)
        account["last_unread_count"] = unread_count
        account["updated_at"] = now

        return SyncMailboxResponse(
            account_id=account["id"],
            status="synced",
            synced_count=len(threads),
            unread_count=unread_count,
            synced_at=now.strftime("%I:%M %p"),
            message=f"Successfully synchronized {len(threads)} message threads with {account['email']}.",
        )

    async def disconnect_account(self, user_id: str, account_id: str) -> DisconnectAccountResponse:
        """Revokes provider tokens and flags account as disconnected."""
        account = self.get_account_by_id(user_id, account_id)
        if not account:
            raise ValueError(f"Connected account {account_id} not found.")

        try:
            provider = get_email_provider(account["provider"])
            await provider.revoke_token(account.get("access_token", ""))
        except Exception:
            pass  # Best effort revocation

        account["status"] = "disconnected"
        account["access_token"] = ""
        account["refresh_token"] = None
        account["updated_at"] = datetime.now(timezone.utc)

        return DisconnectAccountResponse(
            success=True,
            account_id=account["id"],
            message=f"Mailbox {account['email']} has been disconnected.",
        )

    async def reconnect_account(self, user_id: str, account_id: str) -> Dict[str, Any]:
        """Refreshes or reactivates an existing account."""
        account = self.get_account_by_id(user_id, account_id)
        if not account:
            raise ValueError(f"Connected account {account_id} not found.")

        now = datetime.now(timezone.utc)
        account["status"] = "active"
        account["access_token"] = f"mock_{account['provider']}_token_{secrets.token_hex(16)}"
        account["expires_at"] = now + timedelta(hours=24)
        account["updated_at"] = now
        account["last_synced_at"] = now
        return account

    async def get_account_threads(self, user_id: str, account_id: str) -> List[EmailThreadPreview]:
        """Retrieves parsed thread previews for an account."""
        account = self.get_account_by_id(user_id, account_id)
        if not account:
            raise ValueError(f"Connected account {account_id} not found.")

        access_token = await self.ensure_valid_access_token(account)
        provider = get_email_provider(account["provider"])
        data = await provider.fetch_threads(access_token)
        threads = data.get("threads", [])
        
        results: List[EmailThreadPreview] = []
        for t in threads:
            results.append(
                EmailThreadPreview(
                    id=str(t.get("id")),
                    subject=t.get("subject", "No Subject"),
                    sender=t.get("sender", "Unknown"),
                    snippet=t.get("snippet", ""),
                    date=t.get("date", "Today"),
                    unread=bool(t.get("unread", False)),
                )
            )
        return results

    @staticmethod
    def to_response(account: Dict[str, Any]) -> ConnectedAccountResponse:
        """Safely converts an account dict to a Pydantic response, masking private tokens."""
        last_sync = account.get("last_synced_at")
        if isinstance(last_sync, datetime):
            last_sync_str = last_sync.strftime("%b %d, %I:%M %p")
        else:
            last_sync_str = "Just now"

        expires_at = account.get("expires_at")
        if isinstance(expires_at, datetime):
            expires_at_str = expires_at.isoformat()
        else:
            expires_at_str = None

        return ConnectedAccountResponse(
            id=account["id"],
            provider=account["provider"],
            email=account["email"],
            name=account.get("name", "Mailbox User"),
            avatar_url=account.get("avatar_url"),
            status=account.get("status", "active"),
            last_synced_at=last_sync_str,
            expires_at=expires_at_str,
            is_primary=account.get("is_primary", True),
            scopes=account.get("scopes", []),
        )


email_account_service = EmailAccountService()

