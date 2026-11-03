from datetime import datetime
from typing import Literal, Optional, List
from pydantic import BaseModel, Field


EmailProviderType = Literal["google", "microsoft"]
EmailAccountStatus = Literal["active", "expired", "disconnected", "error"]


class EmailTokens(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "Bearer"
    expires_in: int = 3600
    scope: Optional[str] = None
    expires_at: Optional[datetime] = None


class EmailProfile(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None
    provider_user_id: Optional[str] = None


class OAuthUrlResponse(BaseModel):
    url: str
    state: str
    provider: str


class EmailOAuthCallbackPayload(BaseModel):
    code: str
    state: str
    redirect_uri: Optional[str] = None


class ConnectedAccountResponse(BaseModel):
    id: str
    provider: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    status: EmailAccountStatus = "active"
    last_synced_at: Optional[str] = None
    expires_at: Optional[str] = None
    is_primary: bool = True
    scopes: List[str] = Field(default_factory=list)


class SyncMailboxResponse(BaseModel):
    account_id: str
    status: str
    synced_count: int
    unread_count: int
    synced_at: str
    message: str


class DisconnectAccountResponse(BaseModel):
    success: bool
    account_id: str
    message: str


class ProviderInfo(BaseModel):
    provider: str
    display_name: str
    icon: str
    is_configured: bool
    scopes: List[str]
    description: str


class ProviderListResponse(BaseModel):
    providers: List[ProviderInfo]


class EmailThreadPreview(BaseModel):
    id: str
    subject: str
    sender: str
    snippet: str
    date: str
    unread: bool = False


class AccountThreadsResponse(BaseModel):
    account_id: str
    total: int
    threads: List[EmailThreadPreview]

