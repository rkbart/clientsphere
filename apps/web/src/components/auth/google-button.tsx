"use client";

import { useEffect, useState } from "react";

// GET to the API's OmniAuth request phase (rewritten to Rails in
// next.config.ts). Rendered only when the backend reports Google configured.
// GET is enabled server-side (OmniAuth.config.allowed_request_methods) so the
// API-only Rails app doesn't need a CSRF-token-issuing form.
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
    <a href="/auth/google_oauth2" className="btn-secondary w-full py-2.5 inline-flex items-center justify-center gap-2">
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.5-5.35 3.5a5.9 5.9 0 0 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.1-2.1A8.9 8.9 0 0 0 12 3a8.9 8.9 0 0 0 0 17.8c4.4 0 8.1-3.1 8.9-7.3.1-.6.15-1.2.15-1.9 0-.5-.05-.85-.1-1.5z"
        />
      </svg>
      {label}
    </a>
  );
}
