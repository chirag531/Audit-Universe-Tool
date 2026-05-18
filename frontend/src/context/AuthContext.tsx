import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AuthResponse } from "@/types/api";

export interface AuthContextValue {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  displayName: string | null;
  login: (data: AuthResponse, options?: { persistUsername?: boolean; username?: string }) => void;
  logout: () => void;
}

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("accessToken"));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refreshToken"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [displayName, setDisplayName] = useState<string | null>(localStorage.getItem("lastUsername"));

  const login = (data: AuthResponse, options?: { persistUsername?: boolean; username?: string }) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("role", data.role);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setRole(data.role);
    const u = options?.username;
    if (u != null) {
      if (options?.persistUsername) {
        localStorage.setItem("lastUsername", u);
      } else {
        localStorage.removeItem("lastUsername");
      }
      setDisplayName(u);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("lastUsername");
    setAccessToken(null);
    setRefreshToken(null);
    setRole(null);
    setDisplayName(null);
  };

  const value = useMemo(
    () => ({ accessToken, refreshToken, role, displayName, login, logout }),
    [accessToken, refreshToken, role, displayName]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthContextValue {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
