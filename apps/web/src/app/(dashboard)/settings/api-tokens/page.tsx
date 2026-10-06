"use client";

import { useState } from "react";
import { useApiTokens, useCreateApiToken, useRevokeApiToken } from "@/hooks/use-api-tokens";
import { Field, FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/error";
import { Check, ChevronLeft, Copy, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCanManageSettings } from "@/hooks/use-current-role";
import { ManagerOnlyNotice } from "@/components/settings/manager-only-notice";
import { ActionBanner, useActionNotice } from "@/components/shared/action-banner";
import { ConfirmDialog, ResultModal } from "@/components/ui/modal";

export default function ApiTokensSettingsPage() {
  const { data: tokens = [], isLoading } = useApiTokens();
  const create = useCreateApiToken();
  const revoke = useRevokeApiToken();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<(typeof tokens)[number] | null>(null);
  const [tokenResult, setTokenResult] = useState<string | null>(null);
  const { notice, notify, dismiss } = useActionNotice();
  const canManage = useCanManageSettings();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setNewToken(null);
    try {
      const label = name.trim();
      const created = await create.mutateAsync({
        name: label,
        expires_at: expiresAt || null,
      });
      setNewToken(created.token);
      setName("");
      setExpiresAt("");
      setTokenResult(`Token “${label}” created.`);
    } catch (err) {
      setError(errMessage(err, "Could not create the token."));
    }
  };

  const copyToken = async () => {
    if (!newToken) return;
    await navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!canManage) return <ManagerOnlyNotice title="API Tokens" />;

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
        <h1 className="text-2xl font-semibold tracking-tight mt-2">API Tokens</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Personal access tokens for scripts and integrations — send as{" "}
          <code className="font-mono">Authorization: Bearer csk_…</code>
        </p>
      </div>

      <FormError message={error} />

      {newToken && (
        <div className="rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-4 space-y-2">
          <p className="text-sm font-medium">Copy this token now — it won&apos;t be shown again.</p>
          <div className="flex items-center gap-2">
            <code className="text-xs break-all flex-1">{newToken}</code>
            <button type="button" onClick={copyToken} className="btn-ghost p-2" aria-label="Copy token">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Token
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" htmlFor="token-name" required>
            <input
              id="token-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="zapier, backup script…"
              required
            />
          </Field>
          <Field label="Expires (optional)" htmlFor="token-expires">
            <input
              id="token-expires"
              type="date"
              className="input"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </Field>
        </div>
        <button type="submit" disabled={create.isPending} className="btn-primary">
          {create.isPending ? "Creating…" : "Create token"}
        </button>
      </form>

      {notice && <ActionBanner notice={notice} onDismiss={dismiss} />}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="table-cell table-header text-left">Name</th>
                <th className="table-cell table-header text-left">Prefix</th>
                <th className="table-cell table-header text-left">Last used</th>
                <th className="table-cell table-header text-left">Expires</th>
                <th className="table-cell table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {tokens.map((t) => (
                <tr key={t.id} className="table-row">
                  <td className="table-cell font-medium">{t.name}</td>
                  <td className="table-cell text-[var(--text-secondary)] text-sm font-mono">{t.prefix}…</td>
                  <td className="table-cell text-[var(--text-secondary)] text-sm">
                    {t.last_used_at ? new Date(t.last_used_at).toLocaleString() : "Never"}
                  </td>
                  <td className="table-cell text-[var(--text-secondary)] text-sm">
                    {t.expires_at ? new Date(t.expires_at).toLocaleDateString() : "Never"}
                  </td>
                  <td className="table-cell">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setConfirmRevoke(t)}
                        className="btn-ghost p-2"
                        aria-label={`Revoke token ${t.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && tokens.length === 0 && (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
              No tokens yet — create one for your scripts or integrations.
            </p>
          )}
        </div>
      </div>

      <ResultModal
        open={!!tokenResult}
        onClose={() => setTokenResult(null)}
        tone="success"
        title="Token created"
        message={`${tokenResult ?? ""} Copy it now — it won't be shown again.`}
      />

      <ConfirmDialog
        open={!!confirmRevoke}
        onClose={() => setConfirmRevoke(null)}
        onConfirm={() => {
          if (!confirmRevoke) return;
          const name = confirmRevoke.name;
          setError(null);
          setConfirmRevoke(null);
          revoke.mutate(confirmRevoke.id, {
            onSuccess: () => notify({ tone: "success", message: `Token “${name}” revoked.` }),
            onError: (e) => setError(errMessage(e, "Could not revoke the token.")),
          });
        }}
        title="Revoke token?"
        message={`${confirmRevoke?.name ?? "This token"} will stop working immediately. Integrations using it will break. This action cannot be undone.`}
        confirming={revoke.isPending}
      />
    </div>
  );
}
