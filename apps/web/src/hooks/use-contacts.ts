import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export function useContacts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["contacts", params],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/contacts", {
        params: params as never,
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ["contacts", id],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/contacts/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contact: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/contacts", {
        body: { contact: contact as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...contact }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/contacts/{id}", {
        params: { path: { id: id as string } },
        body: contact as never,
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/contacts/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
