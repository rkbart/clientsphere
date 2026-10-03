export type FilterSnapshot = Record<string, string | number>;

function storageKey(page: string) {
  return `clientsphere-filters:${page}`;
}

export function readRememberedFilters(page: string): FilterSnapshot {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(page));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: FilterSnapshot = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string" || typeof v === "number") out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function persistFilters(page: string, snapshot: FilterSnapshot) {
  try {
    window.localStorage.setItem(storageKey(page), JSON.stringify(snapshot));
  } catch {
    // Private mode etc. — filters simply won't persist.
  }
}
