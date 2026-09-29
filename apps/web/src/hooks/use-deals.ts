import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function useDeals(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["deals", params],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/deals", { params: params as never });
      if (error) throw error;
      return data;
    },
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ["deals", id],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/deals/{id}", { params: { path: { id } } });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deal: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/deals", { body: deal as never });
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
      const { error } = await apiClient.DELETE("/deals/{id}", { params: { path: { id } } });
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
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}
