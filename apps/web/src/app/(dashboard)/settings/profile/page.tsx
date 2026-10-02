"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Avatar } from "@/components/shared/avatar";
import { ChevronLeft } from "lucide-react";

export default function ProfileSettingsPage() {
  const { user, account } = useAuthStore();

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

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name} size="lg" />
          <div>
            <p className="text-lg font-semibold">{user?.name ?? "…"}</p>
            <p className="text-sm text-[var(--text-secondary)]">{user?.email ?? ""}</p>
          </div>
        </div>
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
      </div>
    </div>
  );
}
