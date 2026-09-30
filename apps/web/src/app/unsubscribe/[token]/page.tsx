"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { CheckCircle2, XCircle } from "lucide-react";

export default function UnsubscribePage() {
  const routeParams = useParams<{ token: string }>();
  const token = Array.isArray(routeParams?.token) ? routeParams.token[0] : routeParams?.token;
  const [state, setState] = useState<"pending" | "done" | "error">("pending");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    let cancelled = false;
    apiClient
      .POST("/unsubscribe", { body: { token } })
      .then(({ error }) => {
        if (!cancelled) setState(error ? "error" : "done");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
      <div className="card p-10 max-w-md w-full text-center space-y-4">
        {state === "pending" && <p className="text-sm text-[var(--text-secondary)]">Processing…</p>}
        {state === "done" && (
          <>
            <CheckCircle2 className="h-8 w-8 mx-auto text-[var(--success)]" />
            <h1 className="text-xl font-semibold tracking-tight">Unsubscribed</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              You won&apos;t receive further emails from this sequence.
            </p>
          </>
        )}
        {state === "error" && (
          <>
            <XCircle className="h-8 w-8 mx-auto text-[var(--danger)]" />
            <h1 className="text-xl font-semibold tracking-tight">Link invalid</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              This unsubscribe link is invalid or expired. Contact the sender directly.
            </p>
          </>
        )}
        <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline">
          ClientSphere login
        </Link>
      </div>
    </div>
  );
}
