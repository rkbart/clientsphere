import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export interface Note {
  id: string;
  body: string;
  notable_type: string;
  notable_id: string;
  author_id: string;
  created_at: string;
}

export function useNotes(notableType: "Contact" | "Company" | "Deal", notableId?: string) {
  return useQuery({
    queryKey: ["notes", notableType, notableId],
    enabled: !!notableId,
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/notes", {
        params: {
          query: { notable_type: notableType, notable_id: notableId as string, per_page: 100 },
        },
        headers: headers(),
      });
      if (error) throw error;
      return (data as unknown as { data: Note[] })?.data ?? [];
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note: {
      body: string;
      notable_type: "Contact" | "Company" | "Deal";
      notable_id: string;
    }) => {
      const { data, error } = await apiClient.POST("/notes", {
        body: { note: note as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", variables.notable_type, variables.notable_id],
      });
    },
  });
}
