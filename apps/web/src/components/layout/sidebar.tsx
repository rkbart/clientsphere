"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Building2, DollarSign, Layout, Activity, Mail, Zap, Bot, Settings, Info } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Deals", href: "/deals", icon: DollarSign },
  { name: "Pipeline", href: "/pipeline", icon: Layout },
  { name: "Activities", href: "/activities", icon: Activity },
  { name: "Sequences", href: "/sequences", icon: Mail },
  { name: "Automations", href: "/automations", icon: Zap },
  { name: "AI Assistant", href: "/ai", icon: Bot },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "About", href: "/about", icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Link href="/dashboard" className="text-xl font-bold">
          ClientSphere
        </Link>
      </div>

      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
