import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuthResponse, LoginPayload, SignupPayload, User } from "../types/auth";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  signup: (payload: SignupPayload) => Promise<AuthResponse>;
  handleOAuthSuccess: (res: AuthResponse) => void;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("mymail_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("mymail_token");
      if (storedToken) {
        try {
          const profile = await api.getMe(storedToken);
          setUser(profile);
          setToken(storedToken);
        } catch {
          // Token expired or invalid
          localStorage.removeItem("mymail_token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.login(payload);
    localStorage.setItem("mymail_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
    const res = await api.signup(payload);
    localStorage.setItem("mymail_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const handleOAuthSuccess = (res: AuthResponse) => {
    localStorage.setItem("mymail_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      if (token) {
        await api.logout();
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem("mymail_token");
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        handleOAuthSuccess,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
