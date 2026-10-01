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

export function useDeliverEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { contact_id: string; deal_id?: string; subject: string; body: string }) => {
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
