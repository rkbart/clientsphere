"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/password_resets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          (Array.isArray(data?.error) ? data.error.join(", ") : data?.error) ||
            "Could not send the reset email."
        );
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset email.");
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
          <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {sent
              ? "Check your inbox for a reset link"
              : "We'll email you a link to choose a new one"}
          </p>
        </div>

        {sent ? (
          <div className="card p-6 space-y-4 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              If an account exists for <span className="text-[var(--text-primary)]">{email}</span>,
              a reset link is on its way. The link expires in 2 hours.
            </p>
            <Link href="/login" className="btn-primary w-full justify-center">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-[var(--radius-md)] bg-red-50 border border-red-100 text-red-600 text-sm animate-scale-in">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[var(--text-primary)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          <Link href="/login" className="hover:text-[var(--text-primary)] transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
