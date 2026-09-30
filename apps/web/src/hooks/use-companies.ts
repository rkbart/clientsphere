import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export function useCompanies(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["companies", params],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/companies", {
        params: { query: params as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCompany(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["companies", id],
    enabled: options?.enabled ?? !!id,
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/companies/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (company: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/companies", {
        body: { company: company as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...company }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/companies/{id}", {
        params: { path: { id: id as string } },
        body: company as never,
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/companies/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}
