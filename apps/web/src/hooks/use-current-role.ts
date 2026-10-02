import { useAuthStore } from "@/store/auth-store";
import { useMemberships } from "@/hooks/use-team";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

/**
 * The signed-in user's role in the active workspace. Null until memberships
 * load, so treat null as "not yet known" rather than "no access".
 */
export function useCurrentRole(): WorkspaceRole | null {
  const user = useAuthStore((s) => s.user);
  const { data: memberships = [] } = useMemberships();
  const own = memberships.find((m) => m.user?.id === user?.id);
  return (own?.role as WorkspaceRole | undefined) ?? null;
}

/** Settings that mutate workspace-wide configuration. */
export function useCanManageSettings(): boolean {
  const role = useCurrentRole();
  return role === "owner" || role === "admin";
}
