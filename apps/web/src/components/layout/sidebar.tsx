"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { useUnreadEmailCount } from "@/hooks/use-emails";
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  GitBranch,
  Activity,
  Calendar,
  Mail,
  Settings,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Deals", href: "/deals", icon: TrendingUp },
  { name: "Pipeline", href: "/pipeline", icon: GitBranch },
  { name: "Activities", href: "/activities", icon: Activity },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Automations", href: "/automations", icon: Zap },
  { name: "Mail", href: "/emails", icon: Mail },
];

const secondary = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "About", href: "/about", icon: Info },
];

// Below Tailwind's lg breakpoint (1024px) the sidebar is an icon rail;
// expanding it opens a temporary overlay that collapses on navigation.
const MOBILE_QUERY = "(max-width: 1023px)";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const setCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const toggleCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);
  const isMobile = useIsMobile();
  const initial = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const { data: mailCounts } = useUnreadEmailCount();
  // Sidebar badge = everything needing attention: unread replies plus
  // outbound drafts and failures (the tab badges split the same total).
  const attentionCount =
    (mailCounts?.unread_count ?? 0) + (mailCounts?.failed_count ?? 0) + (mailCounts?.draft_count ?? 0);
  const mailLabel = attentionCount > 0 ? `Mail, ${attentionCount} need attention` : "Mail";

  // Mobile overlay open while expanded.
  const overlayOpen = isMobile && !collapsed;

  useEffect(() => {
    if (collapsed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && window.matchMedia(MOBILE_QUERY).matches) {
        setCollapsed(true);
      }
    };
    document.addEventListener("keydown", onKey);
    // Lock body scroll only while the mobile overlay covers the page.
    const mq = window.matchMedia(MOBILE_QUERY);
    const applyLock = () => {
      document.body.style.overflow = mq.matches ? "hidden" : "";
    };
    applyLock();
    mq.addEventListener("change", applyLock);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", applyLock);
      document.body.style.overflow = "";
    };
  }, [collapsed, setCollapsed]);

  // On mobile the expanded sidebar is temporary — collapse it when a
  // destination is picked. Desktop keeps its collapsed/expanded state.
  const collapseOnMobileNav = () => {
    if (window.matchMedia(MOBILE_QUERY).matches) setCollapsed(true);
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const content = ({ iconOnly, behindOverlay }: { iconOnly: boolean; behindOverlay?: boolean }) => {
    const tabIndex = behindOverlay ? -1 : undefined;
    return (
      <>
        <div
          className={`h-14 flex items-center border-b border-white/5 ${
            iconOnly ? "justify-center px-0" : "justify-between px-5"
          }`}
        >
          <Link
            href="/dashboard"
            onClick={collapseOnMobileNav}
            tabIndex={tabIndex}
            aria-label="ClientSphere home"
            className="flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--accent-on-dark)] flex items-center justify-center shrink-0">
              <span className="font-display italic text-white text-base leading-none pb-0.5">C</span>
            </div>
            {!iconOnly && (
              <span className="font-display text-white text-[17px] tracking-tight whitespace-nowrap">
                ClientSphere
              </span>
            )}
          </Link>
        </div>

        <nav aria-label="Primary" className={`flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden ${iconOnly ? "px-1" : "px-3"}`}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const badge = item.name === "Mail" ? attentionCount : 0;
            const badgeText = badge > 99 ? "99+" : String(badge);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={collapseOnMobileNav}
                tabIndex={tabIndex}
                aria-current={active ? "page" : undefined}
                aria-label={iconOnly ? (item.name === "Mail" ? mailLabel : item.name) : undefined}
                title={iconOnly ? (item.name === "Mail" ? mailLabel : item.name) : undefined}
                className={`relative flex items-center gap-2.5 py-2 rounded-[var(--radius-md)] text-sm group ${
                  iconOnly ? "justify-center px-0" : "px-3"
                } ${
                  active
                    ? "bg-white/[0.07] text-white"
                    : "text-[var(--text-sidebar)] hover:bg-[var(--bg-sidebar-hover)] hover:text-white"
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[var(--accent-on-dark)]"
                  />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active
                      ? "text-white"
                      : "text-[var(--text-tertiary)] group-hover:text-white"
                  }`}
                />
                {!iconOnly && <span className="flex-1 whitespace-nowrap">{item.name}</span>}
                {badge > 0 &&
                  (iconOnly ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-0.5 right-0.5 min-w-4 px-1 text-center text-[10px] leading-4 font-semibold rounded-full bg-[var(--danger)] text-white"
                    >
                      {badgeText}
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="shrink-0 min-w-5 px-1.5 text-center text-[11px] leading-5 font-semibold rounded-full bg-[var(--danger)] text-white"
                    >
                      {badgeText}
                    </span>
                  ))}
              </Link>
            );
          })}
        </nav>

        <div className={`py-3 border-t border-white/5 space-y-0.5 ${iconOnly ? "px-1" : "px-3"}`}>
          {secondary.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={collapseOnMobileNav}
                tabIndex={tabIndex}
                aria-current={active ? "page" : undefined}
                aria-label={iconOnly ? item.name : undefined}
                title={iconOnly ? item.name : undefined}
                className={`relative flex items-center gap-2.5 py-2 rounded-[var(--radius-md)] text-sm ${
                  iconOnly ? "justify-center px-0" : "px-3"
                } ${
                  active
                    ? "bg-white/[0.07] text-white"
                    : "text-[var(--text-sidebar)] hover:bg-[var(--bg-sidebar-hover)] hover:text-white"
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[var(--accent-on-dark)]"
                  />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? "text-white" : "text-[var(--text-tertiary)]"
                  }`}
                />
                {!iconOnly && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        <div className={`py-3 border-t border-white/5 ${iconOnly ? "px-1" : "px-3"}`}>
          <div
            className={`flex items-center gap-2.5 py-2 ${iconOnly ? "justify-center px-0" : "px-3"}`}
            title={iconOnly ? (user?.name ?? undefined) : undefined}
          >
            <div className="w-7 h-7 rounded-[var(--radius-md)] bg-white/10 flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="font-display italic text-white text-sm leading-none pb-px">{initial}</span>
            </div>
            {!iconOnly && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.name ?? "…"}</p>
                <p className="text-[var(--text-tertiary)] text-xs truncate">{user?.email ?? ""}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={toggleCollapsed}
            tabIndex={tabIndex}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`mt-1 flex items-center gap-2.5 py-2 rounded-[var(--radius-md)] text-sm text-[var(--text-sidebar)] hover:bg-[var(--bg-sidebar-hover)] hover:text-white transition-colors w-full ${
              iconOnly ? "justify-center px-0" : "px-3"
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            {!iconOnly && <span className="whitespace-nowrap">Collapse</span>}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Desktop sidebar — full rail or collapsed icon rail */}
      <aside
        aria-label="Navigation"
        className={`hidden lg:flex fixed inset-y-0 left-0 bg-[var(--bg-sidebar)] flex-col z-40 transition-[width] duration-200 ${
          collapsed ? "w-10" : "w-60"
        }`}
        style={{ transitionTimingFunction: "var(--ease-drawer)" }}
      >
        {content({ iconOnly: collapsed })}
      </aside>

      {/* Mobile icon rail — always visible, inert while the overlay is open */}
      <aside
        aria-label="Navigation"
        aria-hidden={overlayOpen}
        className="lg:hidden fixed inset-y-0 left-0 w-10 bg-[var(--bg-sidebar)] flex flex-col z-30"
      >
        {content({ iconOnly: true, behindOverlay: overlayOpen })}
      </aside>

      {/* Mobile backdrop — only while the expanded overlay is open */}
      <div
        onClick={() => setCollapsed(true)}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 lg:hidden ${
          overlayOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile expanded overlay — visibility rides the transform transition
          so closed links leave the focus order only after the exit finishes */}
      <aside
        data-nav-drawer
        role="dialog"
        aria-modal={overlayOpen ? "true" : undefined}
        aria-label="Navigation"
        aria-hidden={!overlayOpen}
        className={`fixed inset-y-0 left-0 w-60 bg-[var(--bg-sidebar)] flex flex-col z-50 lg:hidden transition-[transform,visibility] duration-[250ms] ${
          overlayOpen ? "translate-x-0 visible" : "-translate-x-full invisible"
        }`}
        style={{ transitionTimingFunction: "var(--ease-drawer)" }}
      >
        {content({ iconOnly: false })}
      </aside>
    </>
  );
}
