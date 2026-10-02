"use client";

import { useCanManageSettings } from "@/hooks/use-current-role";
import { Lock } from "lucide-react";

interface SettingsCard {
  href: string;
  title: string;
  description: string;
  /** Workspace-wide configuration: owners and admins only. */
  managerOnly?: boolean;
}

const CARDS: SettingsCard[] = [
  { href: "/settings/profile", title: "Profile", description: "Manage your account settings" },
  { href: "/settings/team", title: "Team", description: "Manage team members and roles" },
  {
    href: "/settings/ai",
    title: "AI Provider",
    description: "Configure AI settings",
    managerOnly: true,
  },
  {
    href: "/settings/email",
    title: "Email",
    description: "Resend API key, sender and tracking",
    managerOnly: true,
  },
  { href: "/settings/custom-fields", title: "Custom Fields", description: "Define custom data fields" },
  {
    href: "/settings/plugins",
    title: "Plugins",
    description: "Webhook plugins for CRM events",
    managerOnly: true,
  },
  {
    href: "/settings/pipelines",
    title: "Pipelines",
    description: "Manage sales processes and their stages",
    managerOnly: true,
  },
  {
    href: "/settings/webhooks",
    title: "Webhooks",
    description: "Configure webhook integrations",
    managerOnly: true,
  },
  {
    href: "/settings/api-tokens",
    title: "API Tokens",
    description: "Personal access tokens for integrations",
    managerOnly: true,
  },
  {
    href: "/settings/import-export",
    title: "Import/Export",
    description: "Import and export data",
    managerOnly: true,
  },
];

export default function SettingsPage() {
  const canManage = useCanManageSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CARDS.map((card) => {
          const locked = card.managerOnly && !canManage;

          if (locked) {
            return (
              <div
                key={card.href}
                aria-disabled="true"
                className="card p-6 opacity-60 cursor-not-allowed"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">{card.title}</h2>
                  <span className="badge badge-neutral inline-flex items-center gap-1 text-xs">
                    <Lock className="h-3 w-3" />
                    Owner &amp; admin
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] mt-2">{card.description}</p>
              </div>
            );
          }

          return (
            <a
              key={card.href}
              href={card.href}
              className="card p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className="text-[var(--text-secondary)] mt-2">{card.description}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
