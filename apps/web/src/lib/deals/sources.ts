/**
 * Canonical deal sources. The API stores `deals.source` as free text, so
 * anything not in this list is still accepted — the deal form keeps an
 * existing unknown value selectable instead of silently rewriting it.
 */
export const DEAL_SOURCES = [
  "referral",
  "website",
  "cold outreach",
  "social",
  "event",
  "partner",
] as const;

/** Sentinel for the "Others" entry, which reveals a free-text input. */
export const CUSTOM_SOURCE = "__custom__";

export function isKnownSource(value: string): boolean {
  return (DEAL_SOURCES as readonly string[]).includes(value.trim());
}
