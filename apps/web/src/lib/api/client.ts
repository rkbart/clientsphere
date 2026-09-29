import createClient from "openapi-fetch";
import type { paths } from "./schema";

const API_BASE = "/api/v1";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("clientsphere-auth");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const token = parsed?.state?.token;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

export const apiClient = createClient<paths>({
  baseUrl: API_BASE,
});

export function getAuthHeadersForApi(): Record<string, string> {
  return getAuthHeaders();
}
