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

export function useAiChat() {
  return useMutation({
    mutationFn: async (message: string) => {
      const { data, error } = await apiClient.POST("/ai/chat", {
        body: { message },
        headers: headers(),
      });
      if (error) throw error;
      return data as { response?: string };
    },
  });
}

export function useDraftEmail() {
  return useMutation({
    mutationFn: async ({ contactId, purpose }: { contactId: string; purpose?: string }) => {
      const { data, error } = await apiClient.POST("/ai/draft_email", {
        body: { contact_id: contactId, purpose },
        headers: headers(),
      });
      if (error) throw error;
      return data as { draft?: string };
    },
  });
}

export function useSuggestNextAction() {
  return useMutation({
    mutationFn: async ({ recordType, recordId }: { recordType: string; recordId: string }) => {
      const { data, error } = await apiClient.POST("/ai/suggest_next_action", {
        body: { record_type: recordType, record_id: recordId },
        headers: headers(),
      });
      if (error) throw error;
      return data as { suggestion?: string };
    },
  });
}

export function useSummarizeDeal() {
  return useMutation({
    mutationFn: async (dealId: string) => {
      const { data, error } = await apiClient.POST("/ai/summarize_deal", {
        body: { deal_id: dealId },
        headers: headers(),
      });
      if (error) throw error;
      return data as { summary?: string };
    },
  });
}

export function useEnrichCompany() {
  return useMutation({
    mutationFn: async (domain: string) => {
      const { data, error } = await apiClient.POST("/ai/enrich", {
        body: { domain },
        headers: headers(),
      });
      if (error) throw error;
      return data as {
        name?: string;
        industry?: string;
        description?: string;
        size_range?: string;
        annual_revenue?: number | string | null;
      };
    },
  });
}
