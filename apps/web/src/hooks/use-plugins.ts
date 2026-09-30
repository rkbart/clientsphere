import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export interface PluginRecord {
  id: string;
  name: string;
  description?: string;
  triggers: string[];
  webhook_url?: string;
  is_active: boolean;
}

export function usePlugins() {
  return useQuery({
    queryKey: ["plugins"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/plugins", {
        headers: headers(),
      });
      if (error) throw error;
      return (data ?? []) as unknown as PluginRecord[];
    },
  });
}

export function useCreatePlugin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plugin: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/plugins", {
        body: { plugin: plugin as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plugins"] });
    },
  });
}

export function useUpdatePlugin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...plugin }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/plugins/{id}", {
        params: { path: { id: id as string } },
        body: { plugin: plugin as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plugins"] });
    },
  });
}

export function useDeletePlugin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/plugins/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plugins"] });
    },
  });
}
