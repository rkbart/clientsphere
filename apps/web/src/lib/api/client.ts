import createClient from "openapi-fetch";
import type { paths } from "./schema";

const API_BASE = "/api/v1";

export const apiClient = createClient<paths>({
  baseUrl: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token: string) {
  apiClient.headers.Authorization = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete apiClient.headers.Authorization;
}
