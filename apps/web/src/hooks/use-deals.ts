import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export function useDeals(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["deals", params],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/deals", {
        params: { query: params as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useDeal(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["deals", id],
    enabled: options?.enabled ?? !!id,
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/deals/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useDealSummary(id: string) {
  return useQuery({
    queryKey: ["deals", id, "summary"],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/deals/{id}/summary", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as { summary?: string; stale?: boolean };
    },
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deal: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/deals", {
        body: { deal: deal as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...deal }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/deals/{id}", {
        params: { path: { id: id as string } },
        body: deal as never,
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/deals/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useMoveDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage_id, position }: { id: string; stage_id: string; position: number }) => {
      const { data, error } = await apiClient.PATCH("/deals/{id}/move", {
        params: { path: { id } },
        body: { stage_id, position },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}
