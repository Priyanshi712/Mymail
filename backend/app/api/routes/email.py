from typing import List
from fastapi import APIRouter, HTTPException, status, Depends

from app.api.deps import get_current_user
from app.models.auth import UserResponse
from app.models.email_provider import (
    ProviderListResponse,
    OAuthUrlResponse,
    EmailOAuthCallbackPayload,
    ConnectedAccountResponse,
    SyncMailboxResponse,
    DisconnectAccountResponse,
    AccountThreadsResponse,
)
from app.services.email.factory import list_available_providers, get_email_provider
from app.services.email.service import email_account_service

router = APIRouter(prefix="/email", tags=["Email Provider Integration"])


@router.get("/providers", response_model=ProviderListResponse)
def get_providers():
    """Returns available email providers and their configuration capabilities."""
    return ProviderListResponse(providers=list_available_providers())


@router.get("/oauth/{provider}/url", response_model=OAuthUrlResponse)
def get_oauth_authorization_url(
    provider: str,
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Generates a secure OAuth 2.0 authorization URL with an anti-CSRF state token
    bound to the authenticated user's session.
    """
    try:
        email_provider = get_email_provider(provider)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    state = email_account_service.create_oauth_state(
        user_id=current_user.id,
        provider=email_provider.provider_name,
    )
    url = email_provider.get_authorization_url(state=state)

    return OAuthUrlResponse(
        url=url,
        state=state,
        provider=email_provider.provider_name,
    )


@router.post("/oauth/{provider}/callback", response_model=ConnectedAccountResponse)
async def oauth_callback(
    provider: str,
    payload: EmailOAuthCallbackPayload,
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Exchanges the OAuth 2.0 authorization code for access and refresh tokens,
    verifies the anti-CSRF state token, and links the mailbox to the user account.
    """
    try:
        account = await email_account_service.connect_account(
            user_id=current_user.id,
            provider_name=provider,
            code=payload.code,
            state=payload.state,
            redirect_uri=payload.redirect_uri,
        )
        return email_account_service.to_response(account)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/accounts", response_model=List[ConnectedAccountResponse])
def get_connected_accounts(
    current_user: UserResponse = Depends(get_current_user),
):
    """Lists all connected email provider accounts for the authenticated user."""
    accounts = email_account_service.get_user_accounts(current_user.id)
    return [email_account_service.to_response(acc) for acc in accounts]


@router.get("/accounts/{account_id}/status", response_model=ConnectedAccountResponse)
def get_account_status(
    account_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    """Checks connection health and token freshness for a connected email account."""
    account = email_account_service.get_account_by_id(current_user.id, account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email account '{account_id}' was not found.",
        )
    return email_account_service.to_response(account)


@router.post("/accounts/{account_id}/sync", response_model=SyncMailboxResponse)
async def sync_account_mailbox(
    account_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    """Triggers an on-demand mailbox synchronization using the provider's API."""
    try:
        return await email_account_service.sync_mailbox(
            user_id=current_user.id,
            account_id=account_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/accounts/{account_id}/disconnect", response_model=DisconnectAccountResponse)
async def disconnect_account(
    account_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    """Disconnects the mailbox, revoking active OAuth tokens with the email provider."""
    try:
        return await email_account_service.disconnect_account(
            user_id=current_user.id,
            account_id=account_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/accounts/{account_id}/reconnect", response_model=ConnectedAccountResponse)
async def reconnect_account(
    account_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    """Re-activates or refreshes credentials for a connected account."""
    try:
        account = await email_account_service.reconnect_account(
            user_id=current_user.id,
            account_id=account_id,
        )
        return email_account_service.to_response(account)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/accounts/{account_id}/threads", response_model=AccountThreadsResponse)
async def get_account_threads(
    account_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    """Fetches thread previews for a connected account."""
    try:
        threads = await email_account_service.get_account_threads(
            user_id=current_user.id,
            account_id=account_id,
        )
        return AccountThreadsResponse(
            account_id=account_id,
            total=len(threads),
            threads=threads,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

