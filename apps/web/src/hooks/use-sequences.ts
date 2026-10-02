import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export function useSequences() {
  return useQuery({
    queryKey: ["sequences"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/email_sequences", { headers: headers() });
      if (error) throw error;
      return data;
    },
  });
}

export function useSequence(id: string) {
  return useQuery({
    queryKey: ["sequences", id],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/email_sequences/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSequence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sequence: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/email_sequences", {
        body: { email_sequence: sequence as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences"] });
    },
  });
}

export function useUpdateSequence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...sequence }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/email_sequences/{id}", {
        params: { path: { id: id as string } },
        body: { email_sequence: sequence as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences"] });
    },
  });
}

export function useDeleteSequence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/email_sequences/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences"] });
    },
  });
}

export function useSequenceSteps(sequenceId: string) {
  return useQuery({
    queryKey: ["sequences", sequenceId, "steps"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/email_sequences/{email_sequence_id}/steps", {
        params: { path: { email_sequence_id: sequenceId } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateStep(sequenceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (step: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/email_sequences/{email_sequence_id}/steps", {
        params: { path: { email_sequence_id: sequenceId } },
        body: { email_sequence_step: step as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences", sequenceId, "steps"] });
    },
  });
}

export function useUpdateStep(sequenceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...step }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/email_sequences/{email_sequence_id}/steps/{id}", {
        params: { path: { email_sequence_id: sequenceId, id: id as string } },
        body: { email_sequence_step: step as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences", sequenceId, "steps"] });
    },
  });
}

export function useDeleteStep(sequenceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/email_sequences/{email_sequence_id}/steps/{id}", {
        params: { path: { email_sequence_id: sequenceId, id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences", sequenceId, "steps"] });
    },
  });
}

export function useEnrollContact(sequenceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contactId: string) => {
      const { data, error } = await apiClient.POST("/email_sequences/{id}/enroll", {
        params: { path: { id: sequenceId } },
        body: { contact_id: contactId },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences", sequenceId, "enrollments"] });
    },
  });
}

export function useEnrollments(sequenceId: string) {
  return useQuery({
    queryKey: ["sequences", sequenceId, "enrollments"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/email_sequences/{email_sequence_id}/enrollments", {
        params: { path: { email_sequence_id: sequenceId } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useUnsubscribeEnrollment(sequenceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await apiClient.POST("/sequence_enrollments/{id}/unsubscribe", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sequences", sequenceId, "enrollments"] });
    },
  });
}
