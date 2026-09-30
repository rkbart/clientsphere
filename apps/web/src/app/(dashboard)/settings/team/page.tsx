"use client";

import { useState } from "react";
import {
  useMemberships,
  useUpdateMembershipRole,
  useRemoveMembership,
  useInviteMember,
} from "@/hooks/use-team";
import { useAuthStore } from "@/store/auth-store";
import { Field, FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { Check, Copy, Trash2 } from "lucide-react";

const ROLES = ["owner", "admin", "member", "viewer"];
const INVITE_ROLES = ["admin", "member", "viewer"];

export default function TeamSettingsPage() {
  const { data: memberships = [], isLoading } = useMemberships();
  const updateRole = useUpdateMembershipRole();
  const remove = useRemoveMembership();
  const invite = useInviteMember();
  const currentUser = useAuthStore((s) => s.user);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteEmailed, setInviteEmailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const ownMembership = memberships.find((m) => m.user?.id === (currentUser as { id?: string } | null)?.id);
  const isManager = ownMembership?.role === "owner" || ownMembership?.role === "admin";

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
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Members, roles and invitations for this workspace
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
                      {m.user?.name ?? "—"}
                      {isSelf && (
                        <span className="ml-2 text-xs text-[var(--text-tertiary)]">(you)</span>
                      )}
                    </td>
                    <td className="table-cell text-[var(--text-secondary)] text-sm">{m.user?.email}</td>
                    <td className="table-cell">
                      {isManager ? (
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
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="badge badge-neutral">{m.role}</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-end">
                        {isManager && (
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
                {INVITE_ROLES.map((r) => (
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
                  : "Email delivery isn't configured — share this link directly:"}
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
