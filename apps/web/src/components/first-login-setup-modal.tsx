"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";
import { ResultModal } from "@/components/ui/modal";
import type { User } from "@/types";

const headers = () => getAuthHeadersForApi();
const MIN_PASSWORD_LENGTH = 8;

export function FirstLoginSetupModal() {
  const { user, account, setUser, setAccount } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [workspaceName, setWorkspaceName] = useState(account?.name ?? "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The auth store hydrates async from localStorage — seed the fields once
  // the user record arrives so invitees see their placeholder name.
  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name || "");
      setPhone((prev) => prev || user.phone || "");
    }
    if (account) {
      setWorkspaceName((prev) => prev || account.name || "");
    }
  }, [user, account]);

  // Hooks before the early return: invited users with no welcome_seen_at
  // haven't completed onboarding yet. `done` keeps the success dialog mounted
  // after saving flips welcome_seen_at on the fresh user record.
  const needsSetup = !!user && !user.welcome_seen_at;
  if ((!needsSetup && !done) || !user) return null;

  const showForm = needsSetup && !done;

  // Fresh Google signups land on an auto-created "<name>'s workspace" they
  // never chose — offer a rename. Invitees join an existing workspace, so
  // the field stays hidden for them. The pristine auto-name is captured on
  // first render; edits to the field must not hide it mid-typing.
  const [pristineWorkspaceName] = useState(account?.name ?? "");
  const showWorkspaceField =
    !!account && pristineWorkspaceName.endsWith("'s workspace");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please tell your team your name.");
      return;
    }
    if (showWorkspaceField && !workspaceName.trim()) {
      setError("Please name your workspace.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string | boolean | null> = {
        name: name.trim(),
        phone: phone.trim() || null,
        password,
        password_confirmation: confirmation,
        welcome_seen: true,
      };
      if (showWorkspaceField) body.account_name = workspaceName.trim();
      const { data, error: apiError } = await apiClient.PATCH("/users/me", {
        body,
        headers: headers(),
      });
      if (apiError) throw new Error("Could not save your account.");
      const payload = data as unknown as User & { account_name?: string };
      setUser(payload as User);
      if (payload.account_name && account) {
        setAccount({ ...account, name: payload.account_name });
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your account.");
      setSaving(false);
    }
  };

  const inputClass = "input w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-elevated)]/95 px-4">
      {showForm ? (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-login-title"
        className="card w-full max-w-md p-6 space-y-5"
      >
        <div>
          <h2 id="first-login-title" className="text-xl font-semibold tracking-tight">
            Set up your account
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            You joined {account?.name ?? "this workspace"}. Confirm how your team
            reaches you
            {showWorkspaceField ? (
              <>, name your workspace, then choose a password so you can also sign in with email.</>
            ) : (
              <>, then choose a password so you can sign in again.</>
            )}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="setup-email" className="block text-sm font-medium">
              Work email
            </label>
            <input
              id="setup-email"
              className={`${inputClass} opacity-60`}
              value={user.email}
              disabled
              readOnly
              aria-describedby="setup-email-hint"
            />
            <p id="setup-email-hint" className="text-xs text-[var(--text-tertiary)]">
              This is the address you were invited with — it can&apos;t be changed here.
            </p>
          </div>

          {showWorkspaceField && (
            <div className="space-y-1.5">
              <label htmlFor="setup-workspace" className="block text-sm font-medium">
                Workspace name
              </label>
              <input
                id="setup-workspace"
                className={inputClass}
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g. Acme Inc"
                autoComplete="organization"
                required
              />
              <p className="text-xs text-[var(--text-tertiary)]">
                Google created “{pristineWorkspaceName}” for you — rename it to
                your company or team.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="setup-name" className="block text-sm font-medium">
              Your name
            </label>
            <input
              id="setup-name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Rivera"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="setup-phone" className="block text-sm font-medium">
              Phone <span className="font-normal text-[var(--text-tertiary)]">(optional)</span>
            </label>
            <input
              id="setup-phone"
              type="tel"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 010 2030"
              autoComplete="tel"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="setup-password" className="block text-sm font-medium">
              New password
            </label>
            <input
              id="setup-password"
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="setup-password-confirm" className="block text-sm font-medium">
              Confirm password
            </label>
            <input
              id="setup-password-confirm"
              type="password"
              className={inputClass}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

          <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
            {saving ? "Saving…" : "Save and continue"}
          </button>
        </form>
      </div>
      ) : null}

      <ResultModal
        open={done}
        onClose={() => setDone(false)}
        tone="success"
        title="You're all set"
        message={`Welcome to ${account?.name ?? "the workspace"}, ${name.trim()}! Your profile is saved — you can update it anytime under Settings → Profile.`}
        confirmLabel="Start exploring"
      />
    </div>
  );
}
