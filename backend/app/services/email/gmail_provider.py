import secrets
import urllib.parse
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
import httpx

from app.core.config import settings
from app.models.email_provider import EmailTokens, EmailProfile
from app.services.email.base import BaseEmailProvider


class GmailEmailProvider(BaseEmailProvider):
    """
    Google Gmail API integration using OAuth 2.0.
    Provides secure offline access with refresh tokens, user profile extraction,
    thread querying, and token revocation.
    """

    AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    REVOKE_URL = "https://oauth2.googleapis.com/revoke"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    GMAIL_PROFILE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/profile"
    GMAIL_THREADS_URL = "https://gmail.googleapis.com/gmail/v1/users/me/threads"

    @property
    def provider_name(self) -> str:
        return "google"

    @property
    def display_name(self) -> str:
        return "Google Gmail"

    @property
    def default_scopes(self) -> List[str]:
        return [
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ]

    def is_configured(self) -> bool:
        return bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)

    def get_authorization_url(self, state: str, redirect_uri: Optional[str] = None) -> str:
        resolved_redirect = redirect_uri or settings.GOOGLE_REDIRECT_URI

        if not self.is_configured():
            # Development / Sandbox Mode URL
            params = {
                "code": "mock_google_code_priyanshi",
                "state": state,
                "provider": "google",
            }
            return f"{resolved_redirect}?{urllib.parse.urlencode(params)}"

        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": resolved_redirect,
            "response_type": "code",
            "scope": " ".join(self.default_scopes),
            "access_type": "offline",  # Request refresh token
            "prompt": "consent",        # Force consent screen to guarantee refresh token
            "include_granted_scopes": "true",
            "state": state,
        }
        return f"{self.AUTH_URL}?{urllib.parse.urlencode(params)}"

    async def exchange_code(self, code: str, redirect_uri: Optional[str] = None) -> EmailTokens:
        resolved_redirect = redirect_uri or settings.GOOGLE_REDIRECT_URI

        if not self.is_configured():
            now = datetime.now(timezone.utc)
            expires_in = 3600
            return EmailTokens(
                access_token=f"mock_google_access_token_{secrets.token_hex(16)}",
                refresh_token=f"mock_google_refresh_token_{secrets.token_hex(16)}",
                token_type="Bearer",
                expires_in=expires_in,
                scope=" ".join(self.default_scopes),
                expires_at=now + timedelta(seconds=expires_in),
            )

        data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": resolved_redirect,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(self.TOKEN_URL, data=data)
            if resp.status_code != 200:
                raise ValueError(f"Failed to exchange Google OAuth code: {resp.text}")
            
            token_data = resp.json()
            expires_in = token_data.get("expires_in", 3600)
            now = datetime.now(timezone.utc)

            return EmailTokens(
                access_token=token_data["access_token"],
                refresh_token=token_data.get("refresh_token"),
                token_type=token_data.get("token_type", "Bearer"),
                expires_in=expires_in,
                scope=token_data.get("scope", " ".join(self.default_scopes)),
                expires_at=now + timedelta(seconds=expires_in),
            )

    async def refresh_token(self, refresh_token: str) -> EmailTokens:
        if not self.is_configured():
            now = datetime.now(timezone.utc)
            expires_in = 3600
            return EmailTokens(
                access_token=f"mock_refreshed_google_token_{secrets.token_hex(16)}",
                refresh_token=refresh_token,
                token_type="Bearer",
                expires_in=expires_in,
                scope=" ".join(self.default_scopes),
                expires_at=now + timedelta(seconds=expires_in),
            )

        data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(self.TOKEN_URL, data=data)
            if resp.status_code != 200:
                raise ValueError(f"Failed to refresh Google OAuth token: {resp.text}")

            token_data = resp.json()
            expires_in = token_data.get("expires_in", 3600)
            now = datetime.now(timezone.utc)

            return EmailTokens(
                access_token=token_data["access_token"],
                refresh_token=token_data.get("refresh_token", refresh_token),
                token_type=token_data.get("token_type", "Bearer"),
                expires_in=expires_in,
                scope=token_data.get("scope", " ".join(self.default_scopes)),
                expires_at=now + timedelta(seconds=expires_in),
            )

    async def get_user_profile(self, access_token: str) -> EmailProfile:
        if not self.is_configured():
            return EmailProfile(
                email="priyanshi27705@gmail.com",
                name="Priyanshi (Google Mailbox)",
                picture="https://lh3.googleusercontent.com/a/default-user",
                provider_user_id="google_sub_27705",
            )

        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(self.USERINFO_URL, headers=headers)
            if resp.status_code != 200:
                raise ValueError(f"Failed to fetch Google userinfo: {resp.text}")

            info = resp.json()
            return EmailProfile(
                email=info.get("email", ""),
                name=info.get("name", "Google User"),
                picture=info.get("picture"),
                provider_user_id=str(info.get("id")),
            )

    async def fetch_threads(
        self,
        access_token: str,
        max_results: int = 20,
        page_token: Optional[str] = None,
        query: Optional[str] = None,
    ) -> Dict[str, Any]:
        if not self.is_configured():
            # Return realistic sample threads matching the Inbox demo data
            sample_threads = [
                {
                    "id": "1",
                    "subject": "Q4 Cloud Infrastructure Budget Sign-off Needed",
                    "sender": "Sarah Chen <sarah.chen@acme.corp>",
                    "snippet": "Can you confirm if we have green light for the additional compute clusters before 4 PM today?",
                    "date": "10:24 AM",
                    "unread": True,
                },
                {
                    "id": "2",
                    "subject": "Partnership Agreement — Revised Term Sheet",
                    "sender": "Marcus Vance <marcus@vancecap.io>",
                    "snippet": "Please review the updated IP clauses in Section 4.3 and let us know your team's feedback.",
                    "date": "Yesterday",
                    "unread": True,
                },
                {
                    "id": "3",
                    "subject": "[Priyanshi712/Mymail] Run succeeded: Production Verification",
                    "sender": "GitHub Notifications <notifications@github.com>",
                    "snippet": "All 14 checks passed in 48s. Milestone B shell modules verified cleanly.",
                    "date": "Oct 20",
                    "unread": False,
                },
                {
                    "id": "4",
                    "subject": "API Integration Milestone Review",
                    "sender": "Elena Rostova <elena@productlab.dev>",
                    "snippet": "Drafted the endpoint specifications for the Gmail OAuth token refresh. Does this match your schema?",
                    "date": "Oct 19",
                    "unread": False,
                },
            ]
            return {
                "threads": sample_threads,
                "resultSizeEstimate": len(sample_threads),
                "nextPageToken": None,
            }

        headers = {"Authorization": f"Bearer {access_token}"}
        params: Dict[str, Any] = {"maxResults": min(max_results, 50)}
        if page_token:
            params["pageToken"] = page_token
        if query:
            params["q"] = query

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(self.GMAIL_THREADS_URL, headers=headers, params=params)
            if resp.status_code != 200:
                raise ValueError(f"Failed to fetch Gmail threads: {resp.text}")
            return resp.json()

    async def revoke_token(self, token: str) -> bool:
        if not self.is_configured():
            return True

        params = {"token": token}
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(self.REVOKE_URL, params=params)
            return resp.status_code == 200

