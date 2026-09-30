import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export interface SavedViewRecord {
  id: string;
  entity_type: string;
  name: string;
  filters: Record<string, string>;
  sort: Record<string, unknown>;
  columns: Record<string, unknown>;
  shared: boolean;
}

export function useSavedViews(entityType?: string) {
  return useQuery({
    queryKey: ["saved-views", entityType ?? "all"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/saved_views", {
        params: { query: (entityType ? { entity_type: entityType } : {}) as never },
        headers: headers(),
      });
      if (error) throw error;
      return (data ?? []) as unknown as SavedViewRecord[];
    },
  });
}

export function useCreateSavedView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (view: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/saved_views", {
        body: { saved_view: view as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-views"] });
    },
  });
}

export function useUpdateSavedView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...view }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/saved_views/{id}", {
        params: { path: { id: id as string } },
        body: { saved_view: view as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-views"] });
    },
  });
}

export function useDeleteSavedView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/saved_views/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-views"] });
    },
  });
}
