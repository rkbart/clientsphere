"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  GitBranch,
  Activity,
  Bot,
  Calendar,
  Settings,
  Info,
  ChevronRight,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Deals", href: "/deals", icon: TrendingUp },
  { name: "Pipeline", href: "/pipeline", icon: GitBranch },
  { name: "Activities", href: "/activities", icon: Activity },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "AI Assistant", href: "/ai", icon: Bot },
];

const secondary = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "About", href: "/about", icon: Info },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const initial = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const content = (
    <>
      <div className="h-14 flex items-center justify-between px-5 border-b border-white/5">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5"
        >
          <div className="w-7 h-7 rounded-[var(--radius-md)] bg-white/10 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">C</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">
            ClientSphere
          </span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 -mr-1.5 rounded-[var(--radius-md)] text-white/60 hover:text-white hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav aria-label="Primary" className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-sm group ${
                isActive
                  ? "bg-[var(--bg-sidebar-active)] text-white"
                  : "text-[var(--text-sidebar)] hover:bg-[var(--bg-sidebar-hover)] hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive
                    ? "text-white"
                    : "text-[var(--text-tertiary)] group-hover:text-white"
                }`}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 text-white/40" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-white/5 space-y-0.5">
        {secondary.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-sm ${
                isActive
                  ? "bg-[var(--bg-sidebar-active)] text-white"
                  : "text-[var(--text-sidebar)] hover:bg-[var(--bg-sidebar-hover)] hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive ? "text-white" : "text-[var(--text-tertiary)]"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center" aria-hidden="true">
            <span className="text-white text-xs font-medium">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name ?? "…"}</p>
            <p className="text-[var(--text-tertiary)] text-xs truncate">{user?.email ?? ""}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 bg-[var(--bg-sidebar)] flex-col z-40">
        {content}
      </aside>

      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile drawer — visibility rides the transform transition so closed
          links leave the focus order only after the exit finishes */}
      <aside
        data-nav-drawer
        role="dialog"
        aria-modal={open ? "true" : undefined}
        aria-label="Navigation"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 w-60 bg-[var(--bg-sidebar)] flex flex-col z-50 lg:hidden transition-[transform,visibility] duration-[250ms] ${
          open ? "translate-x-0 visible" : "-translate-x-full invisible"
        }`}
        style={{ transitionTimingFunction: "var(--ease-drawer)" }}
      >
        {content}
      </aside>
    </>
  );
}
