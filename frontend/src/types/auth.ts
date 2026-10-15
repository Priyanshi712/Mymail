export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface SignupPayload {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  token: string;
  new_password: string;
  confirm_new_password: string;
}

export interface OAuthUrlResponse {
  url: string;
  state: string;
  provider: string;
}

export interface OAuthCallbackPayload {
  code: string;
  state: string;
}

