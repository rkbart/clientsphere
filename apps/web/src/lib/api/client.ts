import createClient from "openapi-fetch";
import type { paths } from "./schema";

const API_BASE = "/api/v1";

export const apiClient = createClient<paths>({
  baseUrl: API_BASE,
});

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

export function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
}
