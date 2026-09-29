import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export const AUTOMATION_TRIGGERS = [
  "contact_created",
  "contact_updated",
  "deal_created",
  "deal_stage_changed",
  "deal_won",
  "deal_lost",
  "activity_completed",
  "activity_overdue",
] as const;

export const AUTOMATION_ACTIONS = [
  "create_task",
  "send_email",
  "add_tag",
  "move_stage",
  "call_webhook",
] as const;

export function useAutomations() {
  return useQuery({
    queryKey: ["automations"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/automations", { headers: headers() });
      if (error) throw error;
      return data;
    },
  });
}

export function useAutomation(id: string) {
  return useQuery({
    queryKey: ["automations", id],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/automations/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (automation: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/automations", {
        body: { automation: automation as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...automation }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/automations/{id}", {
        params: { path: { id: id as string } },
        body: { automation: automation as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/automations/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
}

export function useToggleAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await apiClient.POST("/automations/{id}/toggle", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
}

export function useAutomationRuns(id: string) {
  return useQuery({
    queryKey: ["automations", id, "runs"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/automations/{id}/runs", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}
