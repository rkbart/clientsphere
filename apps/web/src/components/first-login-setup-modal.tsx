"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";
import type { User } from "@/types";

const headers = () => getAuthHeadersForApi();
const MIN_PASSWORD_LENGTH = 8;

export function FirstLoginSetupModal() {
  const { user, account, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || user.welcome_seen_at) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const { data, error: apiError } = await apiClient.PATCH("/users/me", {
        body: {
          name: name.trim(),
          password,
          password_confirmation: confirmation,
          welcome_seen: true,
        },
        headers: headers(),
      });
      if (apiError) throw new Error("Could not save your account.");
      setUser(data as unknown as User);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your account.");
      setSaving(false);
    }
  };

  const inputClass = "input w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-elevated)]/95 px-4">
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
            You joined {account?.name ?? "this workspace"} as {user.email}. Choose the name your
            team will see and a password so you can sign in again.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
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
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="setup-password" className="block text-sm font-medium">
              Password
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
    </div>
  );
}
