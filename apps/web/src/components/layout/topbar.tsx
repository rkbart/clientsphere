"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { useSwitchWorkspace, useWorkspaces } from "@/hooks/use-workspaces";
import { ChevronDown, LogOut, Moon, Sun } from "lucide-react";

export function Topbar() {
  const { user, account, clearAuth } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const { data: workspaces = [] } = useWorkspaces();
  const switchTo = useSwitchWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click-away closes the workspace menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const handleSwitch = (id: string) => {
    setMenuOpen(false);
    if (id === account?.id || switchTo.isPending) return;
    switchTo.mutate(id);
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-end px-4 sm:px-6">
      <div className="flex items-center gap-1.5">
        <span className="hidden sm:inline text-sm text-[var(--text-secondary)] mr-1.5">
          {user?.name}
        </span>
        {account?.name && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] border border-[var(--border)] rounded-full px-2.5 py-0.5 hover:bg-[var(--accent-soft)] transition-colors"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Switch workspace"
            >
              {account.name}
              <ChevronDown className="h-3 w-3" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 card p-1.5 shadow-lg animate-scale-in"
              >
                <p className="px-2.5 py-1.5 text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
                  Workspaces
                </p>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    role="menuitem"
                    onClick={() => handleSwitch(ws.id)}
                    disabled={switchTo.isPending}
                    className={`w-full text-left px-2.5 py-2 rounded-[var(--radius-md)] text-sm transition-colors hover:bg-[var(--accent-soft)] ${
                      ws.id === account.id
                        ? "text-[var(--accent-hover)] font-medium"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {ws.name}
                    {ws.id === account.id && (
                      <span className="ml-2 text-xs text-[var(--text-tertiary)]">(current)</span>
                    )}
                  </button>
                ))}
                <a
                  href="/settings/workspaces"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-left px-2.5 py-2 mt-1 border-t border-[var(--border)] rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] transition-colors"
                >
                  Manage workspaces…
                </a>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          onClick={handleLogout}
          className="p-2 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
