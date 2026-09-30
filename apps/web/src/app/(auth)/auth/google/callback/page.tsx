"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finish = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setError("Sign-in didn't return a token. Try again.");
        return;
      }
      try {
        const response = await fetch("/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("session rejected");
        const data = await response.json();
        setAuth(data.user, data.account, token);
        router.replace("/dashboard");
      } catch {
        setError("Could not complete Google sign-in. Try again.");
      }
    };

    finish();
  }, [searchParams, setAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="max-w-md w-full space-y-4 p-8 text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Google sign-in failed</h1>
            <p className="text-[var(--text-secondary)] text-sm">{error}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Finishing sign-in…</h1>
            <p className="text-[var(--text-secondary)] text-sm">You will be redirected shortly.</p>
          </>
        )}
        <Link href="/login" className="text-[var(--text-primary)] hover:underline text-sm">
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackInner />
    </Suspense>
  );
}
