"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { GoogleButton } from "@/components/auth/google-button";

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { name, email, password },
          account_name: accountName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Signup failed");
      }

      const data = await response.json();
      setAuth(data.user, data.account, data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-semibold text-lg">C</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Start managing your relationships</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-[var(--radius-md)] bg-red-50 border border-red-100 text-red-600 text-sm animate-scale-in">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-[var(--text-primary)]">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input" placeholder="Your name" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[var(--text-primary)]">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" placeholder="you@example.com" autoComplete="email" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[var(--text-primary)]">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="input" placeholder="Min 8 characters" autoComplete="new-password" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="accountName" className="text-sm font-medium text-[var(--text-primary)]">Workspace name</label>
            <input id="accountName" type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} required className="input" placeholder="e.g. Bean & Brew" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-[var(--border)]" />
          <span className="text-xs text-[var(--text-tertiary)]">or</span>
          <div className="flex-1 border-t border-[var(--border)]" />
        </div>
        <GoogleButton label="Continue with Google" />

        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--text-primary)] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
