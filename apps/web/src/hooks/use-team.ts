import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export interface MembershipRecord {
  id: string;
  role: string;
  user?: { id: string; name: string; email: string } | null;
}

export interface InvitationResult {
  token?: string;
  invite_sent?: boolean;
}

export function useMemberships() {
  return useQuery({
    queryKey: ["memberships"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/memberships", {
        headers: headers(),
      });
      if (error) throw error;
      return (data ?? []) as unknown as MembershipRecord[];
    },
  });
}

export function useUpdateMembershipRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { data, error } = await apiClient.PATCH("/memberships/{id}", {
        params: { path: { id } },
        body: { role } as never,
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
  });
}

export function useRemoveMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/memberships/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
  });
}

export function useInviteMember() {
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data, error } = await apiClient.POST("/invitations", {
        body: { invitation: { email, role } as never },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as InvitationResult;
    },
  });
}
