import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";
import type { Account } from "@/types";

const headers = () => getAuthHeadersForApi();

export interface WorkspaceRecord extends Account {
  role?: string;
}

/** Workspaces the signed-in user belongs to (oldest first). */
export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/accounts", { headers: headers() });
      if (error) throw error;
      return (data ?? []) as unknown as WorkspaceRecord[];
    },
  });
}

/** Create a workspace — the caller becomes owner and lands in it. */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await apiClient.POST("/accounts", {
        body: { account: { name } as never },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as Account;
    },
    onSuccess: (account) => {
      const { user, token, setAccount } = useAuthStore.getState();
      // Backend pinned the session's current_account; mirror it client-side.
      if (user && token) setAuth(user, account, token);
      else setAccount(account);
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
  });
}

/** Switch the active workspace. */
export function useSwitchWorkspace() {
  const queryClient = useQueryClient();
  const setAccount = useAuthStore((s) => s.setAccount);
  return useMutation({
    mutationFn: async (accountId: string) => {
      const { data, error } = await apiClient.POST("/auth/switch_account", {
        body: { account_id: accountId } as never,
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as { account: Account };
    },
    onSuccess: ({ account }) => {
      setAccount(account);
      // Every list is tenant-scoped — wipe caches so the new workspace's
      // data loads instead of the old workspace's.
      queryClient.clear();
    },
  });
}

/** Delete a workspace (owner-only, never the last one) and repoint the session. */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const setAccount = useAuthStore((s) => s.setAccount);
  return useMutation({
    mutationFn: async (accountId: string) => {
      const { data, error } = await apiClient.DELETE("/accounts/{id}", {
        params: { path: { id: accountId } },
        headers: headers(),
      });
      if (error) throw error;
      return data as unknown as { account: Account | null };
    },
    onSuccess: (payload) => {
      if (payload.account) setAccount(payload.account);
      queryClient.clear();
    },
  });
}
