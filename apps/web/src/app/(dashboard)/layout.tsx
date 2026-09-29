"use client";

import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!token || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
