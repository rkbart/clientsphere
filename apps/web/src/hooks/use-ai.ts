import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export interface AiSettings {
  id?: string;
  provider: string | null;
  model: string | null;
  base_url: string | null;
  enabled: boolean;
  redact_pii: boolean;
  api_key_set: boolean;
}

export function useAiSettings() {
  return useQuery({
    queryKey: ["ai-settings"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/ai/settings", { headers: headers() });
      if (error) throw error;
      return data as unknown as AiSettings;
    },
  });
}

export function useUpdateAiSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ai_setting: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/ai/settings", {
        body: { ai_setting: ai_setting as never },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as AiSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-settings"] });
    },
  });
}

export function useTestAiConnection() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.POST("/ai/test_connection", { headers: headers() });
      if (error) throw error;
      return data as { success?: boolean; message?: string };
    },
  });
}


