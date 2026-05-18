import type { AuthResponse, LoginPayload } from "@/types/api";
import api from "@/services/api";

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return (await api.post<AuthResponse>("/auth/login", payload)).data;
}

export async function register(payload: { username: string; email: string; password: string }): Promise<AuthResponse> {
  return (await api.post<AuthResponse>("/auth/register", payload)).data;
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  return (await api.post<AuthResponse>("/auth/refresh", null, { params: { refreshToken } })).data;
}
