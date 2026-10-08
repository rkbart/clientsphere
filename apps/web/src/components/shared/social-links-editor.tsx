"use client";

import { Plus, Trash2 } from "lucide-react";

export interface SocialLink {
  platform: string;
  url: string;
}

export const SOCIAL_PLATFORMS: { value: string; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X (Twitter)" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "github", label: "GitHub" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

// Read-only list: one row per link with the platform name followed by the
// real URL as a clickable link.
export function SocialLinksList({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="sm:col-span-2">
      <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Social</dt>
      <dd className="mt-1.5 space-y-1.5">
        {links.map((l, i) => {
          const found = SOCIAL_PLATFORMS.find((p) => p.value === l.platform);
          return (
            <div key={i} className="flex items-center gap-2 text-sm min-w-0">
              <span className="shrink-0 text-[var(--text-secondary)]">{found?.label ?? l.platform}</span>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate text-[var(--accent-hover)] hover:underline"
              >
                {l.url}
              </a>
            </div>
          );
        })}
      </dd>
    </div>
  );
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
