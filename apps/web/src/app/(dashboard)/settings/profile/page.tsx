"use client";

import { useAuthStore } from "@/store/auth-store";

export default function ProfileSettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile Settings</h1>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Account Info</h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-[var(--text-secondary)]">Name</dt>
            <dd className="mt-1">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--text-secondary)]">Email</dt>
            <dd className="mt-1">{user?.email}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
