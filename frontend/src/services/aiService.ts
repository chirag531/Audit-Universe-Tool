import type { AiProxyResponse } from "@/types/api";
import api from "@/services/api";

export async function aiDescribe(text: string): Promise<AiProxyResponse> {
  return (await api.post<AiProxyResponse>("/ai/describe", { text })).data;
}

export async function aiRecommend(text: string): Promise<AiProxyResponse> {
  return (await api.post<AiProxyResponse>("/ai/recommend", { text })).data;
}

export async function aiReport(text: string): Promise<AiProxyResponse> {
  return (await api.post<AiProxyResponse>("/ai/report", { text })).data;
}
