"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useCanManageSettings } from "@/hooks/use-current-role";
import { useEmailSettings } from "@/hooks/use-emails";
import { Modal } from "@/components/ui/modal";
import { Mail, X } from "lucide-react";

// Nudge shown where unsent mail piles up (Outbox) while nothing can
// deliver it. Managers only — everyone else can't act on it. The modal is
// a one-time onboarding per workspace (persisted skip); the banner is the
// ongoing reminder and only dismisses for the session.
function useShouldNudge(persist: boolean) {
  const account = useAuthStore((s) => s.account);
  const canManage = useCanManageSettings();
  const { data: settings, isLoading } = useEmailSettings();
  // Start dismissed so server and first client paint agree; the effect
  // below corrects from storage (same reason as the sidebar rail).
  const [dismissed, setDismissed] = useState(true);

  const key = persist && account ? `email-setup-dismissed:${account.id}` : null;
  useEffect(() => {
    if (key) setDismissed(window.localStorage.getItem(key) === "1");
    else setDismissed(false);
  }, [key]);

  const dismiss = () => {
    if (key) window.localStorage.setItem(key, "1");
    setDismissed(true);
  };

  // Nudge off the workspace's own credentials, not the global env
  // fallback — env keys are invisible in the UI and can't be managed here.
  const workspaceReady = settings?.workspace_configured ?? false;
  return {
    show: canManage && !isLoading && !workspaceReady && !dismissed,
    dismiss,
  };
}

export function EmailSetupModal() {
  const { show, dismiss } = useShouldNudge(true);

  return (
    <Modal
      open={show}
      onClose={dismiss}
      title="No email provider yet"
      description="Outbound mail is being kept as drafts. Connect a provider to start sending."
    >
      <div className="space-y-3 text-sm text-[var(--text-secondary)]">
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] p-3">
          <p className="font-medium text-[var(--text-primary)]">Resend</p>
          <p className="mt-0.5">Verify a domain at resend.com, then paste the API key in Email Settings.</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] p-3">
          <p className="font-medium text-[var(--text-primary)]">Gmail</p>
          <p className="mt-0.5">
            Turn on 2-Step Verification, create an App password, and paste it in Email Settings.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Link href="/settings/email" className="btn-primary text-sm">
            Open Email Settings
          </Link>
          <button type="button" onClick={dismiss} className="btn-ghost text-sm">
            Skip for now
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function EmailSetupBanner({ showLink = true }: { showLink?: boolean }) {
  const { show, dismiss } = useShouldNudge(false);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 animate-fade-in"
    >
      <Mail className="h-4 w-4 shrink-0 text-[var(--warning-ink)]" aria-hidden="true" />
      <p className="flex-1 text-sm text-[var(--text-secondary)]">
        {showLink ? (
          <>
            Outbound mail is being saved as drafts —{" "}
            <Link href="/settings/email" className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
              connect Resend or Gmail
            </Link>{" "}
            to start sending.
          </>
        ) : (
          <>No sending provider connected yet — outbound mail is being saved as drafts. Choose one below to start sending.</>
        )}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="p-1 shrink-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
