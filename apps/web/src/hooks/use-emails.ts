import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export interface EmailTemplate {
  key: string;
  name: string;
  subject: string;
  body: string;
}

export function useEmailTemplates(contactId?: string) {
  return useQuery({
    queryKey: ["email-templates", contactId ?? null],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/emails/templates", {
        params: { query: { contact_id: contactId } },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as EmailTemplate[];
    },
  });
}

export function useEmails(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["emails", params],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/emails", {
        params: { query: params as never },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as {
        data: Record<string, unknown>[];
        meta: { total_count: number; total_pages: number; current_page: number };
      };
    },
  });
}

export interface EmailSettings {
  from_address?: string | null;
  resend_api_key_set?: boolean;
  webhook_secret_set?: boolean;
  webhook_url?: string | null;
}

export function useEmailSettings() {
  return useQuery({
    queryKey: ["email-settings"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/email_settings", {
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as EmailSettings;
    },
  });
}

export function useUpdateEmailSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/email_settings", {
        body: { email_setting: settings as never },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as EmailSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-settings"] });
    },
  });
}

export function useCreateEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/emails", {
        body: { email: email as never },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as Record<string, unknown>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}

export function useUpdateEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...email }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/emails/{id}", {
        params: { path: { id } },
        body: { email: email as never },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as Record<string, unknown>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}

export function useRedeliverEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await apiClient.POST("/emails/{id}/redeliver", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as Record<string, unknown>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}

export function useDeliverEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      contact_id?: string;
      deal_id?: string;
      subject: string;
      body: string;
      to_addresses?: string[];
      cc_addresses?: string[];
      bcc_addresses?: string[];
    }) => {
      const { data, error } = await apiClient.POST("/emails/deliver", {
        body: payload,
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as { id: string; status: string; to_addresses?: string[] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}
