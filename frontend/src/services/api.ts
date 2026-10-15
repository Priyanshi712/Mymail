import type {
  AuthResponse,
  LoginPayload,
  MessageResponse,
  PasswordResetConfirmPayload,
  PasswordResetRequestPayload,
  SignupPayload,
  User,
} from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

class ApiService {
  private getHeaders(token?: string | null): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    const activeToken = token || localStorage.getItem("mymail_token");
    if (activeToken) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorDetail =
          data.detail ||
          (Array.isArray(data.detail) ? data.detail[0]?.msg : null) ||
          data.message ||
          `Request failed with status ${response.status}`;
        throw new Error(errorDetail);
      }

      return data as T;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error("An unexpected error occurred while communicating with the server.");
    }
  }

  async signup(payload: SignupPayload): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getMe(token?: string): Promise<User> {
    return this.request<User>("/auth/me", {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async forgotPassword(payload: PasswordResetRequestPayload): Promise<MessageResponse> {
    return this.request<MessageResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async resetPassword(payload: PasswordResetConfirmPayload): Promise<MessageResponse> {
    return this.request<MessageResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async logout(): Promise<MessageResponse> {
    return this.request<MessageResponse>("/auth/logout", {
      method: "POST",
    });
  }
}

export const api = new ApiService();
