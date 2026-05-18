import type { AuditItem, StatsResponse } from "@/types/api";
import api from "@/services/api";

export async function createAudit(payload: Pick<AuditItem, "title" | "payload">): Promise<AuditItem> {
  return (await api.post<AuditItem>("/audit-items", payload)).data;
}

export async function listAudits(q = ""): Promise<AuditItem[]> {
  return (await api.get<AuditItem[]>("/audit-items", { params: { q } })).data;
}

export async function getAudit(id: string | number): Promise<AuditItem> {
  return (await api.get<AuditItem>(`/audit-items/${id}`)).data;
}

export async function updateAudit(id: string | number, payload: Pick<AuditItem, "title" | "payload">): Promise<AuditItem> {
  return (await api.put<AuditItem>(`/audit-items/${id}`, payload)).data;
}

export async function deleteAudit(id: string | number): Promise<void> {
  await api.delete(`/audit-items/${id}`);
}

export async function stats(): Promise<StatsResponse> {
  return (await api.get<StatsResponse>("/audit-items/stats")).data;
}

export async function exportAuditsCsv(): Promise<void> {
  const res = await api.get<Blob>("/export/audit-items", { responseType: "blob" });
  const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "audit-items.csv";
  a.click();
  window.URL.revokeObjectURL(url);
}
