"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import {
  useCreateWorkspace,
  useDeleteWorkspace,
  useSwitchWorkspace,
  useWorkspaces,
} from "@/hooks/use-workspaces";
import { Field, FormError } from "@/components/forms/fields";
import { ConfirmDialog, ResultModal } from "@/components/ui/modal";
import { errMessage } from "@/lib/error";
import { ChevronLeft, Plus } from "lucide-react";

export default function WorkspacesSettingsPage() {
  const account = useAuthStore((s) => s.account);
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const create = useCreateWorkspace();
  const switchTo = useSwitchWorkspace();
  const remove = useDeleteWorkspace();

  const [name, setName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<(typeof workspaces)[number] | null>(null);

  // The list endpoint returns id/name/slug only — ownership lives in Team's
  // roles for the active workspace. Deletion is ultimately enforced server-side
  // (403 for non-owners, 422 for the last workspace); the UI just hides it
  // when only one workspace remains. Deleting the current one repoints you
  // to your oldest survivor.
  const isLast = workspaces.length <= 1;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreateError(null);
    try {
      await create.mutateAsync(name.trim());
      setCreated(name.trim());
      setName("");
    } catch (err) {
      setCreateError(errMessage(err, "Could not create the workspace."));
    }
  };

  const doSwitch = (id: string) => {
    if (id === account?.id || switchTo.isPending) return;
    switchTo.mutate(id, {
      onError: () => setCreateError("Could not switch workspace."),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href="/settings"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Workspaces</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Switch between workspaces, or create a new one. You own every workspace you create.
        </p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold">Your workspaces</h2>
        {isLoading ? (
          <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {workspaces.map((ws) => {
              const current = ws.id === account?.id;
              return (
                <li key={ws.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{ws.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {new Date(ws.created_at).toLocaleDateString()}
                      {current && " · current"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!current && (
                      <button
                        onClick={() => doSwitch(ws.id)}
                        disabled={switchTo.isPending}
                        className="btn-secondary text-sm !px-2.5"
                      >
                        {switchTo.isPending ? "Switching…" : "Switch"}
                      </button>
                    )}
                    {!isLast && (
                      <button
                        onClick={() => setConfirmDelete(ws)}
                        className="btn-danger text-sm !px-2.5"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {createError && <FormError message={createError} />}
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold mb-4">Create a workspace</h2>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Workspace name" htmlFor="workspace-name">
            <input
              id="workspace-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Inc"
              required
            />
          </Field>
          <button type="submit" disabled={create.isPending} className="btn-primary">
            <Plus className="h-4 w-4 mr-1" />
            {create.isPending ? "Creating…" : "Create workspace"}
          </button>
        </form>
        <p className="text-xs text-[var(--text-tertiary)] mt-3">
          You&apos;ll become the owner and switch into it right away. Your last
          workspace can never be deleted.
        </p>
      </div>

      <ResultModal
        open={!!created}
        onClose={() => setCreated(null)}
        tone="success"
        title="Workspace created"
        message={`“${created ?? ""}” is ready — you're the owner and you're in it now.`}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          const target = confirmDelete;
          setConfirmDelete(null);
          remove.mutate(target.id, {
            onError: (e) => setCreateError(errMessage(e, "Could not delete the workspace.")),
          });
        }}
        title="Delete workspace?"
        message={`“${confirmDelete?.name ?? ""}” and everything inside it — contacts, deals, pipelines, settings — will be permanently deleted. Members will lose access immediately. This cannot be undone.`}
        confirming={remove.isPending}
      />
    </div>
  );
}