import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export const ACTIVITY_KINDS = ["call", "meeting", "task", "email", "other"] as const;

export function useActivities(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["activities", params],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/activities", {
        params: { query: params as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: ["activities", id],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/activities/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activity: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/activities", {
        body: { activity: activity as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...activity }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/activities/{id}", {
        params: { path: { id: id as string } },
        body: activity as never,
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/activities/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
