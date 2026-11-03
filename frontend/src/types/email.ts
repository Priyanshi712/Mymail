export type EmailProviderType = "google" | "microsoft" | string;
export type EmailAccountStatus = "active" | "expired" | "disconnected" | "error";

export interface ConnectedAccount {
  id: string;
  provider: EmailProviderType;
  email: string;
  name: string;
  avatar_url?: string | null;
  status: EmailAccountStatus;
  last_synced_at?: string | null;
  expires_at?: string | null;
  is_primary: boolean;
  scopes: string[];
}

export interface ProviderInfo {
  provider: string;
  display_name: string;
  icon: string;
  is_configured: boolean;
  scopes: string[];
  description: string;
}

export interface ProviderListResponse {
  providers: ProviderInfo[];
}

export interface EmailOAuthUrlResponse {
  url: string;
  state: string;
  provider: string;
}

export interface EmailOAuthCallbackPayload {
  code: string;
  state: string;
  redirect_uri?: string;
}

export interface SyncMailboxResponse {
  account_id: string;
  status: string;
  synced_count: number;
  unread_count: number;
  synced_at: string;
  message: string;
}

export interface DisconnectAccountResponse {
  success: boolean;
  account_id: string;
  message: string;
}

export interface EmailThreadPreview {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  date: string;
  unread: boolean;
}

export interface AccountThreadsResponse {
  account_id: string;
  total: number;
  threads: EmailThreadPreview[];
}

