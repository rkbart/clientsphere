"use client";

import { useAuthStore } from "@/store/auth-store";
import { LogOut } from "lucide-react";

export function Topbar() {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <header className="h-14 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between px-6">
      <div></div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--text-secondary)]">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
