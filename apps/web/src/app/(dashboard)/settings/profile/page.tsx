"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";
import { Avatar } from "@/components/shared/avatar";
import { Field, FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/error";
import { ActionBanner, useActionNotice } from "@/components/shared/action-banner";
import { ChevronLeft } from "lucide-react";
import type { User } from "@/types";

const headers = () => getAuthHeadersForApi();
const MIN_PASSWORD_LENGTH = 8;

export default function ProfileSettingsPage() {
  const { user, account, setUser } = useAuthStore();
  const { notice, notify, dismiss } = useActionNotice();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setName(user?.name ?? "");
    setPassword("");
    setConfirmation("");
    setError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setPassword("");
    setConfirmation("");
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (password && password.length < MIN_PASSWORD_LENGTH) {
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
      const body: Record<string, string> = { name: name.trim() };
      if (password) {
        body.password = password;
        body.password_confirmation = confirmation;
      }
      const { data, error: apiError } = await apiClient.PATCH("/users/me", {
        body,
        headers: headers(),
      });
      if (apiError) throw new Error("Could not save your profile.");
      setUser(data as unknown as User);
      setEditing(false);
      setPassword("");
      setConfirmation("");
      notify({ tone: "success", message: "Profile updated." });
    } catch (err) {
      setError(errMessage(err, "Could not save your profile."));
    } finally {
      setSaving(false);
    }
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
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Profile Settings</h1>
      </div>

      {notice && <ActionBanner notice={notice} onDismiss={dismiss} />}

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name} size="lg" />
          <div>
            <p className="text-lg font-semibold">{user?.name ?? "…"}</p>
            <p className="text-sm text-[var(--text-secondary)]">{user?.email ?? ""}</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Name" htmlFor="profile-name" required>
              <input
                id="profile-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field label="New password" htmlFor="profile-password">
              <input
                id="profile-password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`Leave blank to keep current (min ${MIN_PASSWORD_LENGTH} characters)`}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirm new password" htmlFor="profile-password-confirm">
              <input
                id="profile-password-confirm"
                type="password"
                className="input"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="new-password"
              />
            </Field>
            {error && <FormError message={error} />}
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button type="button" onClick={cancelEditing} className="btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="text-sm font-semibold mb-4">Account Info</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Name</dt>
                <dd className="mt-0.5 text-sm">{user?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Email</dt>
                <dd className="mt-0.5 text-sm">{user?.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Workspace</dt>
                <dd className="mt-0.5 text-sm">{account?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Member since</dt>
                <dd className="mt-0.5 text-sm">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <button onClick={startEditing} className="btn-primary">
                Edit profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
