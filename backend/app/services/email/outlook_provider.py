import secrets
import urllib.parse
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
import httpx

from app.core.config import settings
from app.models.email_provider import EmailTokens, EmailProfile
from app.services.email.base import BaseEmailProvider


class OutlookEmailProvider(BaseEmailProvider):
    """
    Microsoft Outlook / Office 365 integration using Microsoft Graph API & Azure OAuth 2.0.
    Demonstrates the modular architecture for multi-provider email synchronization.
    """

    AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    GRAPH_ME_URL = "https://graph.microsoft.com/v1.0/me"
    GRAPH_MESSAGES_URL = "https://graph.microsoft.com/v1.0/me/messages"

    @property
    def provider_name(self) -> str:
        return "microsoft"

    @property
    def display_name(self) -> str:
        return "Microsoft Outlook"

    @property
    def default_scopes(self) -> List[str]:
        return [
            "offline_access",
            "User.Read",
            "Mail.Read",
            "Mail.ReadWrite",
            "Mail.Send",
        ]

    def is_configured(self) -> bool:
        return bool(settings.MICROSOFT_CLIENT_ID and settings.MICROSOFT_CLIENT_SECRET)

    def get_authorization_url(self, state: str, redirect_uri: Optional[str] = None) -> str:
        resolved_redirect = redirect_uri or settings.MICROSOFT_REDIRECT_URI

        if not self.is_configured():
            # Development / Sandbox Mode URL
            params = {
                "code": "mock_outlook_code_priyanshi",
                "state": state,
                "provider": "microsoft",
            }
            return f"{resolved_redirect}?{urllib.parse.urlencode(params)}"

        params = {
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": resolved_redirect,
            "response_mode": "query",
            "scope": " ".join(self.default_scopes),
            "state": state,
            "prompt": "select_account",
        }
        return f"{self.AUTH_URL}?{urllib.parse.urlencode(params)}"

    async def exchange_code(self, code: str, redirect_uri: Optional[str] = None) -> EmailTokens:
        resolved_redirect = redirect_uri or settings.MICROSOFT_REDIRECT_URI

        if not self.is_configured():
            now = datetime.now(timezone.utc)
            expires_in = 3600
            return EmailTokens(
                access_token=f"mock_ms_access_token_{secrets.token_hex(16)}",
                refresh_token=f"mock_ms_refresh_token_{secrets.token_hex(16)}",
                token_type="Bearer",
                expires_in=expires_in,
                scope=" ".join(self.default_scopes),
                expires_at=now + timedelta(seconds=expires_in),
            )

        data = {
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "client_secret": settings.MICROSOFT_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": resolved_redirect,
            "scope": " ".join(self.default_scopes),
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(self.TOKEN_URL, data=data)
            if resp.status_code != 200:
                raise ValueError(f"Failed to exchange Microsoft OAuth code: {resp.text}")

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
                access_token=f"mock_refreshed_ms_token_{secrets.token_hex(16)}",
                refresh_token=refresh_token,
                token_type="Bearer",
                expires_in=expires_in,
                scope=" ".join(self.default_scopes),
                expires_at=now + timedelta(seconds=expires_in),
            )

        data = {
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "client_secret": settings.MICROSOFT_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
            "scope": " ".join(self.default_scopes),
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(self.TOKEN_URL, data=data)
            if resp.status_code != 200:
                raise ValueError(f"Failed to refresh Microsoft OAuth token: {resp.text}")

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
                email="priyanshi@outlook.com",
                name="Priyanshi (Outlook Mailbox)",
                picture=None,
                provider_user_id="ms_user_priyanshi",
            )

        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(self.GRAPH_ME_URL, headers=headers)
            if resp.status_code != 200:
                raise ValueError(f"Failed to fetch Microsoft profile: {resp.text}")

            info = resp.json()
            return EmailProfile(
                email=info.get("mail") or info.get("userPrincipalName", ""),
                name=info.get("displayName", "Outlook User"),
                picture=None,
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
            sample_threads = [
                {
                    "id": "ms-1",
                    "subject": "Executive Leadership Review Q4",
                    "sender": "Marcus Vance <marcus@vancecap.io>",
                    "snippet": "Updated term sheet and timeline attached for sync tomorrow.",
                    "date": "11:15 AM",
                    "unread": True,
                }
            ]
            return {
                "threads": sample_threads,
                "resultSizeEstimate": len(sample_threads),
                "nextPageToken": None,
            }

        headers = {"Authorization": f"Bearer {access_token}"}
        params: Dict[str, Any] = {"$top": min(max_results, 50)}

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(self.GRAPH_MESSAGES_URL, headers=headers, params=params)
            if resp.status_code != 200:
                raise ValueError(f"Failed to fetch Outlook messages: {resp.text}")
            return resp.json()

    async def revoke_token(self, token: str) -> bool:
        return True

