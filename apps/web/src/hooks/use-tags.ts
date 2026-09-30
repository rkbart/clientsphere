import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export type TaggableEntity = "Contact" | "Company" | "Deal";

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

const entityQueryKey = (entity: TaggableEntity, id: string) =>
  [`${entity.toLowerCase()}-tags`, id] as const;

// openapi-fetch only accepts literal path strings, so each entity is dispatched
// explicitly rather than interpolated.
export function useEntityTags(entity: TaggableEntity, id?: string) {
  return useQuery({
    queryKey: entityQueryKey(entity, id as string),
    enabled: !!id,
    queryFn: async () => {
      const { data, error } =
        entity === "Contact"
          ? await apiClient.GET("/contacts/{contact_id}/tags", {
              params: { path: { contact_id: id as string } },
              headers: headers(),
            })
          : entity === "Company"
            ? await apiClient.GET("/companies/{company_id}/tags", {
                params: { path: { company_id: id as string } },
                headers: headers(),
              })
            : await apiClient.GET("/deals/{deal_id}/tags", {
                params: { path: { deal_id: id as string } },
                headers: headers(),
              });
      if (error) throw error;
      return (data as unknown as Tag[]) ?? [];
    },
  });
}

export function useAttachEntityTag(entity: TaggableEntity, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tagId: string) => {
      const { error } =
        entity === "Contact"
          ? await apiClient.POST("/contacts/{contact_id}/tags", {
              params: { path: { contact_id: id } },
              body: { tag_id: tagId },
              headers: headers(),
            })
          : entity === "Company"
            ? await apiClient.POST("/companies/{company_id}/tags", {
                params: { path: { company_id: id } },
                body: { tag_id: tagId },
                headers: headers(),
              })
            : await apiClient.POST("/deals/{deal_id}/tags", {
                params: { path: { deal_id: id } },
                body: { tag_id: tagId },
                headers: headers(),
              });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityQueryKey(entity, id) });
      queryClient.invalidateQueries({ queryKey: [`${entity.toLowerCase()}s`] });
    },
  });
}

export function useDetachEntityTag(entity: TaggableEntity, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tagId: string) => {
      const { error } =
        entity === "Contact"
          ? await apiClient.DELETE("/contacts/{contact_id}/tags/{tag_id}", {
              params: { path: { contact_id: id, tag_id: tagId } },
              headers: headers(),
            })
          : entity === "Company"
            ? await apiClient.DELETE("/companies/{company_id}/tags/{tag_id}", {
                params: { path: { company_id: id, tag_id: tagId } },
                headers: headers(),
              })
            : await apiClient.DELETE("/deals/{deal_id}/tags/{tag_id}", {
                params: { path: { deal_id: id, tag_id: tagId } },
                headers: headers(),
              });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityQueryKey(entity, id) });
      queryClient.invalidateQueries({ queryKey: [`${entity.toLowerCase()}s`] });
    },
  });
}
