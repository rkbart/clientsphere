"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { LogOut, Menu, Moon, Sun } from "lucide-react";

const titles: Record<string, string> = {
  dashboard: "Dashboard",
  contacts: "Contacts",
  companies: "Companies",
  deals: "Deals",
  pipeline: "Pipeline",
  activities: "Activities",
  calendar: "Calendar",
  ai: "AI Assistant",
  automations: "Automations",
  sequences: "Sequences",
  settings: "Settings",
  about: "About",
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const segment = pathname.split("/")[1] || "dashboard";
  const title = titles[segment] ?? "ClientSphere";

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden -ml-1.5 p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="lg:hidden text-sm font-semibold truncate">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="hidden sm:inline text-sm text-[var(--text-secondary)] mr-1.5">
          {user?.name}
        </span>
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
