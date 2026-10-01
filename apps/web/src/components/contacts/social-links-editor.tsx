"use client";

import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Link2,
  Linkedin,
  Plus,
  Trash2,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";

export interface SocialLink {
  platform: string;
  url: string;
}

export const SOCIAL_PLATFORMS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "x", label: "X (Twitter)", icon: Twitter },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "github", label: "GitHub", icon: Github },
  { value: "website", label: "Website", icon: Globe },
  { value: "other", label: "Other", icon: Link2 },
];

export function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const found = SOCIAL_PLATFORMS.find((p) => p.value === platform);
  const Icon = found?.icon ?? Link2;
  return <Icon className={className ?? "h-4 w-4"} aria-label={found?.label ?? platform} />;
}

export function SocialLinksEditor({
  value,
  onChange,
}: {
  value: SocialLink[];
  onChange: (next: SocialLink[]) => void;
}) {
  const update = (index: number, patch: Partial<SocialLink>) =>
    onChange(value.map((l, i) => (i === index ? { ...l, ...patch } : l)));

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[var(--text-primary)]">Social links</p>
      {value.map((link, i) => (
        <div key={i} className="flex items-center gap-2">
          <select
            aria-label="Platform"
            className="input max-w-36"
            value={link.platform}
            onChange={(e) => update(i, { platform: e.target.value })}
          >
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            aria-label="Profile URL"
            type="url"
            className="input flex-1"
            placeholder="https://…"
            value={link.url}
            onChange={(e) => update(i, { url: e.target.value })}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="btn-ghost p-2 text-[var(--danger)]"
            aria-label="Remove link"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { platform: "linkedin", url: "" }])}
        className="btn-secondary text-sm"
      >
        <Plus className="h-4 w-4" />
        Add link
      </button>
    </div>
  );
}
