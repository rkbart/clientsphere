"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const router = useRouter();
  const routeParams = useParams<{ token: string }>();
  const token = Array.isArray(routeParams?.token) ? routeParams.token[0] : routeParams?.token;
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/password_resets/${token}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, password_confirmation: confirmation }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          (Array.isArray(data?.error) ? data.error.join(", ") : data?.error) ||
            "This reset link is invalid or has expired."
        );
      }
      router.push("/login?reset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset your password.");
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
          <h1 className="text-xl font-semibold tracking-tight">Choose a new password</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            You&apos;ll be signed out of other devices
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-[var(--radius-md)] bg-red-50 border border-red-100 text-red-600 text-sm animate-scale-in">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[var(--text-primary)]">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmation" className="text-sm font-medium text-[var(--text-primary)]">
              Confirm new password
            </label>
            <input
              id="confirmation"
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              required
              className="input"
              placeholder="Re-enter your new password"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          <Link href="/login" className="hover:text-[var(--text-primary)] transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
