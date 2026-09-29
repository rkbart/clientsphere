import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export function useWebhooks() {
  return useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/webhooks", { headers: headers() });
      if (error) throw error;
      return data;
    },
  });
}

export function useWebhook(id: string) {
  return useQuery({
    queryKey: ["webhooks", id],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/webhooks/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (webhook: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/webhooks", {
        body: { webhook: webhook as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...webhook }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/webhooks/{id}", {
        params: { path: { id: id as string } },
        body: { webhook: webhook as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/webhooks/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
  });
}

export function useWebhookDeliveries(id: string) {
  return useQuery({
    queryKey: ["webhooks", id, "deliveries"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/webhooks/{id}/deliveries", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}
