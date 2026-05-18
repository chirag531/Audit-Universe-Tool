import type { AuditItem, ClientAuditRow, ClientAuditStatus } from "@/types/api";

function daysSince(iso: string): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return (Date.now() - t) / (1000 * 60 * 60 * 24);
}

export function deriveRisk(item: AuditItem): "low" | "medium" | "high" {
  const blob = `${item.title} ${item.payload}`.toLowerCase();
  if (/\b(critical|severe|high\s*risk)\b/.test(blob) || item.payload.length > 480) return "high";
  if (item.payload.length > 220) return "medium";
  return "low";
}

export function deriveStatus(item: AuditItem): ClientAuditStatus {
  const risk = deriveRisk(item);
  if (risk === "high") return "high_risk";
  if (daysSince(item.createdAt) >= 14) return "completed";
  if (item.aiSummary && item.aiSummary.trim().length > 0) return "review";
  return "pending";
}

export function toClientRow(item: AuditItem): ClientAuditRow {
  return {
    ...item,
    clientStatus: deriveStatus(item),
    clientRisk: deriveRisk(item),
  };
}
