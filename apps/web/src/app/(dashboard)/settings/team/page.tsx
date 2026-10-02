"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useMemberships,
  useUpdateMembershipRole,
  useRemoveMembership,
  useInviteMember,
  useInvitations,
  useRevokeInvitation,
} from "@/hooks/use-team";
import { useAuthStore } from "@/store/auth-store";
import { Avatar } from "@/components/shared/avatar";
import { Field, FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { Check, ChevronLeft, Copy, Trash2 } from "lucide-react";

const ROLES = ["owner", "admin", "member", "viewer"];
const INVITE_ROLES = ["admin", "member", "viewer"];
const OWNER_LIMIT = 2;

export default function TeamSettingsPage() {
  const { data: memberships = [], isLoading } = useMemberships();
  const updateRole = useUpdateMembershipRole();
  const remove = useRemoveMembership();
  const invite = useInviteMember();
  const revoke = useRevokeInvitation();
  const currentUser = useAuthStore((s) => s.user);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteEmailed, setInviteEmailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const ownMembership = memberships.find((m) => m.user?.id === (currentUser as { id?: string } | null)?.id);
  const isManager = ownMembership?.role === "owner" || ownMembership?.role === "admin";
  const isOwner = ownMembership?.role === "owner";
  // Owners pick every role; admins can only hand out member/viewer, and the
  // owner option closes once the workspace cap is reached.
  const ownerCount = memberships.filter((m) => m.role === "owner").length;
  const ownerLimitReached = ownerCount >= OWNER_LIMIT;
  const roleOptions = isOwner ? ROLES : ROLES.filter((r) => r === "member" || r === "viewer");
  const inviteRoleOptions = isOwner ? INVITE_ROLES : INVITE_ROLES.filter((r) => r !== "admin");
  const { data: invitations = [] } = useInvitations(isManager);

  const revokeInvite = async (id: string) => {
    setError(null);
    try {
      await revoke.mutateAsync(id);
    } catch (e) {
      setError(errMessage(e, "Could not revoke the invitation."));
    }
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setInviteLink(null);
    try {
      const result = await invite.mutateAsync({ email: email.trim(), role });
      if (result.token) {
        const origin = window.location.origin;
        setInviteLink(`${origin}/accept-invite/${result.token}?email=${encodeURIComponent(email.trim())}`);
      }
      setInviteEmailed(!!result.invite_sent);
      setEmail("");
    } catch (err) {
      setError(errMessage(err, "Could not send the invitation."));
    }
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link
          href="/settings"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Team</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Members, roles and invitations for this workspace. Only owners and
          admins can invite — invitees click the link and are logged in
          automatically. Links expire after 7 days.
        </p>
      </div>

      <FormError message={error} />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="table-cell table-header text-left">Name</th>
                <th className="table-cell table-header text-left">Email</th>
                <th className="table-cell table-header text-left">Role</th>
                <th className="table-cell table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {memberships.map((m) => {
                const isSelf = m.user?.id === (currentUser as { id?: string } | null)?.id;
                return (
                  <tr key={m.id} className="table-row">
                    <td className="table-cell font-medium">
                      <span className="flex items-center gap-2">
                        <Avatar name={m.user?.name} size="sm" />
                        {m.user?.name ?? "—"}
                      </span>
                      {isSelf && (
                        <span className="ml-2 text-xs text-[var(--text-tertiary)]">(you)</span>
                      )}
                    </td>
                    <td className="table-cell text-[var(--text-secondary)] text-sm">{m.user?.email}</td>
                    <td className="table-cell">
                      {isManager && (isOwner || m.role !== "admin") ? (
                        <select
                          value={m.role}
                          onChange={async (e) => {
                            setError(null);
                            try {
                              await updateRole.mutateAsync({ id: m.id, role: e.target.value });
                            } catch (err) {
                              setError(errMessage(err, "Could not change the role."));
                            }
                          }}
                          className="input w-auto text-sm"
                          aria-label={`Role for ${m.user?.email}`}
                        >
                          {roleOptions.map((r) => (
                            <option
                              key={r}
                              value={r}
                              disabled={r === "owner" && ownerLimitReached && m.role !== "owner"}
                            >
                              {r}
                              {r === "owner" && ownerLimitReached && m.role !== "owner"
                                ? ` (limit ${OWNER_LIMIT} reached)`
                                : ""}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="badge badge-neutral">{m.role}</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-end">
                        {isManager && !isSelf && (
                          <button
                            onClick={async () => {
                              if (!confirm(`Remove ${m.user?.email} from the workspace?`)) return;
                              setError(null);
                              try {
                                await remove.mutateAsync(m.id);
                              } catch (e) {
                                setError(errMessage(e, "Could not remove the member."));
                              }
                            }}
                            className="btn-ghost p-2"
                            aria-label={`Remove ${m.user?.email}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {isManager && isSelf && (
                          <span
                            className="text-xs text-[var(--text-tertiary)] pr-2"
                            title="You can't remove yourself from the workspace"
                          >
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!isLoading && memberships.length === 0 && (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">No members found.</p>
          )}
        </div>
      </div>

      {isManager && invitations.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-semibold">Pending invitations ({invitations.length})</h2>
          </div>
          <ul className="divide-y divide-[var(--border-subtle)]">
            {invitations.map((inv) => (
              <li key={inv.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{inv.email}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {inv.role}
                    {inv.expires_at ? ` · expires ${new Date(inv.expires_at).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm(`Revoke the invitation for ${inv.email}?`)) return;
                    await revokeInvite(inv.id);
                  }}
                  className="btn-ghost p-2 text-[var(--danger)]"
                  aria-label={`Revoke invitation for ${inv.email}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isManager && (
        <form onSubmit={sendInvite} className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Invite a Member</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" htmlFor="invite-email" required>
              <input
                id="invite-email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@company.com"
                required
              />
            </Field>
            <Field label="Role" htmlFor="invite-role">
              <select
                id="invite-role"
                className="input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {inviteRoleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <button type="submit" disabled={invite.isPending} className="btn-primary">
            {invite.isPending ? "Inviting…" : "Send invite"}
          </button>
          {inviteLink && (
            <div className="rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-4 space-y-2">
              <p className="text-sm">
                {inviteEmailed
                  ? "Invitation emailed — or share this link directly:"
                  : "The invite email couldn't be sent — share this link directly:"}
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs break-all flex-1">{inviteLink}</code>
                <button type="button" onClick={copyLink} className="btn-ghost p-2" aria-label="Copy invite link">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
