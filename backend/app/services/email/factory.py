from typing import Dict, List
from app.models.email_provider import ProviderInfo
from app.services.email.base import BaseEmailProvider
from app.services.email.gmail_provider import GmailEmailProvider
from app.services.email.outlook_provider import OutlookEmailProvider


_PROVIDERS: Dict[str, BaseEmailProvider] = {
    "google": GmailEmailProvider(),
    "microsoft": OutlookEmailProvider(),
}


def get_email_provider(provider_name: str) -> BaseEmailProvider:
    """
    Factory function to retrieve an EmailProvider by name.
    Normalizes aliases like 'gmail' -> 'google' and 'outlook' -> 'microsoft'.
    """
    normalized = provider_name.lower().strip()
    if normalized == "gmail":
        normalized = "google"
    elif normalized in ("outlook", "office365", "m365"):
        normalized = "microsoft"

    if normalized not in _PROVIDERS:
        raise ValueError(
            f"Unsupported email provider: '{provider_name}'. Supported providers: {list(_PROVIDERS.keys())}"
        )
    return _PROVIDERS[normalized]


def list_available_providers() -> List[ProviderInfo]:
    """Returns a list of all supported email providers and their configuration status."""
    result: List[ProviderInfo] = []
    for key, provider in _PROVIDERS.items():
        desc = (
            "Full OAuth 2.0 integration with Google Gmail API (readonly, send, modify, profile)"
            if key == "google"
            else "Modular integration with Microsoft Graph API for Outlook & Office 365"
        )
        icon = "google" if key == "google" else "microsoft"
        result.append(
            ProviderInfo(
                provider=key,
                display_name=provider.display_name,
                icon=icon,
                is_configured=provider.is_configured(),
                scopes=provider.default_scopes,
                description=desc,
            )
        )
    return result

