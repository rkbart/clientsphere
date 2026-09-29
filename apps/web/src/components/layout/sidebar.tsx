"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  GitBranch,
  Activity,
  Bot,
  Settings,
  Info,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Deals", href: "/deals", icon: TrendingUp },
  { name: "Pipeline", href: "/pipeline", icon: GitBranch },
  { name: "Activities", href: "/activities", icon: Activity },
  { name: "AI Assistant", href: "/ai", icon: Bot },
];

const secondary = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "About", href: "/about", icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-[var(--bg-sidebar)] flex flex-col z-40">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[var(--radius-md)] bg-white/10 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">C</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">
            ClientSphere
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-all duration-150 group ${
                isActive
                  ? "bg-[var(--bg-sidebar-active)] text-white"
                  : "text-[var(--text-sidebar)] hover:bg-[var(--bg-sidebar-hover)] hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[var(--text-tertiary)] group-hover:text-white"}`} />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 text-white/40" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Secondary nav */}
      <div className="px-3 py-3 border-t border-white/5 space-y-0.5">
        {secondary.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-all duration-150 ${
                isActive
                  ? "bg-[var(--bg-sidebar-active)] text-white"
                  : "text-[var(--text-sidebar)] hover:bg-[var(--bg-sidebar-hover)] hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[var(--text-tertiary)]"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white text-xs font-medium">SB</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Sarah</p>
            <p className="text-[var(--text-tertiary)] text-xs truncate">Owner</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
