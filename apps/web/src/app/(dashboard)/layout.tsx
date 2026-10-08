"use client";

import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { FirstLoginSetupModal } from "@/components/first-login-setup-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token } = useAuthStore();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.push("/login");
    }
  }, [mounted, token, router]);

  if (!mounted || !token) {
    return (
      <div className="min-h-screen bg-[var(--bg-elevated)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-elevated)]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar />
      <div
        className={`pl-10 transition-[padding-left] duration-200 ${
          collapsed ? "lg:pl-10" : "lg:pl-60"
        }`}
      >
        <Topbar />
        <main id="main-content" className="p-4 sm:p-6">{children}</main>
      </div>
      <FirstLoginSetupModal />
    </div>
  );
}
