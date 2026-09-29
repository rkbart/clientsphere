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
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div></div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-gray-600"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
