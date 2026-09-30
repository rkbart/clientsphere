import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export interface CustomObjectDefinitionRecord {
  id: string;
  name: string;
  icon: string;
  fields: { name: string; type: string; required?: boolean }[];
}

export interface CustomObjectRecordItem {
  id: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function useCustomObjectDefinitions() {
  return useQuery({
    queryKey: ["custom-object-definitions"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/custom_object_definitions", {
        headers: headers(),
      });
      if (error) throw error;
      return (data ?? []) as unknown as CustomObjectDefinitionRecord[];
    },
  });
}

export function useCreateCustomObjectDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (definition: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/custom_object_definitions", {
        body: { custom_object_definition: definition as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-object-definitions"] });
    },
  });
}

export function useUpdateCustomObjectDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...definition }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/custom_object_definitions/{id}", {
        params: { path: { id: id as string } },
        body: { custom_object_definition: definition as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-object-definitions"] });
    },
  });
}

export function useDeleteCustomObjectDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/custom_object_definitions/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-object-definitions"] });
    },
  });
}

export function useCustomObjectRecords(definitionId: string) {
  return useQuery({
    queryKey: ["custom-object-records", definitionId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/custom_object_definitions/{custom_object_definition_id}/records", {
        params: { path: { custom_object_definition_id: definitionId } },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as { data: CustomObjectRecordItem[]; meta: { total_count: number } };
    },
  });
}

export function useCreateCustomObjectRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ definitionId, data }: { definitionId: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await apiClient.POST("/custom_object_definitions/{custom_object_definition_id}/records", {
        params: { path: { custom_object_definition_id: definitionId } },
        body: { custom_object_record: { data } as never },
        headers: headers(),
      });
      if (error) throw error;
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["custom-object-records", variables.definitionId] });
    },
  });
}

export function useUpdateCustomObjectRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const { data: result, error } = await apiClient.PATCH("/custom_object_records/{id}", {
        params: { path: { id } },
        body: { custom_object_record: { data } as never },
        headers: headers(),
      });
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-object-records"] });
    },
  });
}

export function useDeleteCustomObjectRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/custom_object_records/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-object-records"] });
    },
  });
}
