import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export interface CustomFieldDefinitionRecord {
  id: string;
  entity_type: string;
  key: string;
  label: string;
  field_type: string;
  options?: { choices?: string[] };
  required?: boolean;
  position?: number;
}

export function useCustomFieldDefinitions(entityType?: string) {
  return useQuery({
    queryKey: ["custom-field-definitions", entityType ?? "all"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/custom_field_definitions", {
        params: { query: (entityType ? { entity_type: entityType } : {}) as never },
        headers: headers(),
      });
      if (error) throw error;
      return (data ?? []) as unknown as CustomFieldDefinitionRecord[];
    },
  });
}

export function useCreateCustomFieldDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (definition: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/custom_field_definitions", {
        body: { custom_field_definition: definition as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions"] });
    },
  });
}

export function useUpdateCustomFieldDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...definition }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/custom_field_definitions/{id}", {
        params: { path: { id: id as string } },
        body: { custom_field_definition: definition as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions"] });
    },
  });
}

export function useDeleteCustomFieldDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/custom_field_definitions/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions"] });
    },
  });
}
