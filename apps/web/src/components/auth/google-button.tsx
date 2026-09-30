"use client";

import { useEffect, useState } from "react";

// Posts to the API's OmniAuth request phase (rewritten to Rails in
// next.config.ts). Rendered only when the backend reports Google configured.
export function GoogleButton({ label }: { label: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/auth/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!cancelled && body?.google) setEnabled(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!enabled) return null;

  return (
    <form action="/auth/google_oauth2" method="post">
      <button type="submit" className="btn-secondary w-full py-2.5">
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.5-5.35 3.5a5.9 5.9 0 0 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.1-2.1A8.9 8.9 0 0 0 12 3a8.9 8.9 0 0 0 0 17.8c4.4 0 8.1-3.1 8.9-7.3.1-.6.15-1.2.15-1.9 0-.5-.05-.85-.1-1.5z"
          />
        </svg>
        {label}
      </button>
    </form>
  );
}
