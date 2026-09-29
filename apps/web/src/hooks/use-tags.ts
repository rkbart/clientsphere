import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/tags", { headers: headers() });
      if (error) throw error;
      return (data as unknown as Tag[]) ?? [];
    },
  });
}

export function useContactTags(contactId?: string) {
  return useQuery({
    queryKey: ["contact-tags", contactId],
    enabled: !!contactId,
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/contacts/{contact_id}/tags", {
        params: { path: { contact_id: contactId as string } },
        headers: headers(),
      });
      if (error) throw error;
      return (data as unknown as Tag[]) ?? [];
    },
  });
}

export function useAttachContactTag(contactId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await apiClient.POST("/contacts/{contact_id}/tags", {
        params: { path: { contact_id: contactId } },
        body: { tag_id: tagId },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-tags", contactId] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useDetachContactTag(contactId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await apiClient.DELETE("/contacts/{contact_id}/tags/{tag_id}", {
        params: { path: { contact_id: contactId, tag_id: tagId } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-tags", contactId] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
