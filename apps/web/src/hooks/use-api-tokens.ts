import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export interface ApiTokenRecord {
  id: string;
  name: string;
  prefix: string;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface CreatedApiToken extends ApiTokenRecord {
  token: string;
}

export function useApiTokens() {
  return useQuery({
    queryKey: ["api-tokens"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api_tokens", {
        headers: headers(),
      });
      if (error) throw error;
      return (data ?? []) as unknown as ApiTokenRecord[];
    },
  });
}

export function useCreateApiToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: { name: string; expires_at?: string | null }) => {
      const { data, error } = await apiClient.POST("/api_tokens", {
        body: { api_token: token as never },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as CreatedApiToken;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
  });
}

export function useRevokeApiToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/api_tokens/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
  });
}
