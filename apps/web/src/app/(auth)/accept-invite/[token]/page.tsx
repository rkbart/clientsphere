"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const email = searchParams.get("email");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const response = await fetch(`/api/v1/invitations/${params.token}/accept`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          const data = await response.json();
          setAuth(data.user, data.account, data.token);
          router.push("/dashboard");
        } else {
          const body = await response.json().catch(() => null);
          const message =
            (body as { error?: unknown } | null)?.error ??
            "This invitation link is invalid or expired.";
          setError(Array.isArray(message) ? message.join(", ") : String(message));
        }
      } catch {
        setError("Could not reach the server. Check your connection and try again.");
      }
    };

    acceptInvite();
  }, [params.token, email, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-elevated)]">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Invitation failed</h1>
            <p className="text-[var(--text-primary)]">{error}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Accepting invitation...</h1>
            <p className="text-[var(--text-primary)]">You will be redirected shortly.</p>
          </>
        )}
        <Link href="/login" className="text-[var(--text-primary)] hover:text-[var(--accent-hover)] transition-colors">
          Go to login instead
        </Link>
      </div>
    </div>
  );
}
