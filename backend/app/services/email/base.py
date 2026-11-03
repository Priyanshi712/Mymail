from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from app.models.email_provider import EmailTokens, EmailProfile


class BaseEmailProvider(ABC):
    """
    Abstract Base Class defining the contract for all modular email providers
    (e.g., Google Gmail API, Microsoft Outlook Graph API).
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Unique provider identifier (e.g. 'google', 'microsoft')."""
        pass

    @property
    @abstractmethod
    def display_name(self) -> str:
        """Human-readable provider label (e.g. 'Google Gmail', 'Microsoft Outlook')."""
        pass

    @property
    @abstractmethod
    def default_scopes(self) -> List[str]:
        """Default OAuth 2.0 permission scopes."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if the required client ID/secret credentials are configured."""
        pass

    @abstractmethod
    def get_authorization_url(self, state: str, redirect_uri: Optional[str] = None) -> str:
        """Builds a secure OAuth 2.0 authorization URL with anti-CSRF state token."""
        pass

    @abstractmethod
    async def exchange_code(self, code: str, redirect_uri: Optional[str] = None) -> EmailTokens:
        """Exchanges an authorization code for access and refresh tokens."""
        pass

    @abstractmethod
    async def refresh_token(self, refresh_token: str) -> EmailTokens:
        """Refreshes an expired access token using the stored refresh token."""
        pass

    @abstractmethod
    async def get_user_profile(self, access_token: str) -> EmailProfile:
        """Fetches the user's email address and profile from the provider."""
        pass

    @abstractmethod
    async def fetch_threads(
        self,
        access_token: str,
        max_results: int = 20,
        page_token: Optional[str] = None,
        query: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Fetches message threads from the mailbox."""
        pass

    @abstractmethod
    async def revoke_token(self, token: str) -> bool:
        """Revokes an active access/refresh token with the provider."""
        pass

