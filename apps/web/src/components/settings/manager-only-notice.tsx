"use client";

import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";

/**
 * Shown instead of a settings form when the signed-in user isn't an owner or
 * admin. The API rejects these writes too; this just avoids a dead-end form.
 */
export function ManagerOnlyNotice({ title }: { title: string }) {
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
        <h1 className="text-2xl font-semibold tracking-tight mt-2">{title}</h1>
      </div>

      <div className="card p-10 text-center">
        <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
          <Lock className="h-5 w-5 text-[var(--text-tertiary)]" />
        </div>
        <h2 className="text-base font-semibold">Owner &amp; admin only</h2>
        <p className="text-[var(--text-secondary)] text-sm mt-1.5 max-w-sm mx-auto">
          This setting changes workspace-wide configuration. Ask an owner or admin to make
          changes here.
        </p>
      </div>
    </div>
  );
}
