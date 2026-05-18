export interface AuditItem {
  id: number;
  title: string;
  payload: string;
  aiSummary: string | null;
  createdAt: string;
}

export interface StatsResponse {
  activeCount: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AiProxyResponse {
  summary?: string;
  recommendations?: string;
  report?: string;
  source?: string;
}

export type ClientAuditStatus = "pending" | "review" | "completed" | "high_risk";

export interface ClientAuditRow extends AuditItem {
  clientStatus: ClientAuditStatus;
  clientRisk: "low" | "medium" | "high";
}
