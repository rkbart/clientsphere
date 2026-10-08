"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEmailSettings, useUpdateEmailSettings, useGmailConnectToken, useGmailDisconnect } from "@/hooks/use-emails";
import { FormError } from "@/components/forms/fields";
import { EmailSetupBanner, NoticeBanner } from "@/components/settings/email-setup-nudge";
import { ResultModal } from "@/components/ui/modal";
import { errMessage } from "@/lib/error";
import { Check, ChevronLeft, Copy } from "lucide-react";
import { useCanManageSettings } from "@/hooks/use-current-role";
import { ManagerOnlyNotice } from "@/components/settings/manager-only-notice";

const GMAIL_CONNECT_ERRORS: Record<string, string> = {
  missing: "Gmail connect didn't return an account. Try again.",
  unauthorized: "Only workspace owners and admins can connect Gmail.",
  no_grant: "Google didn't issue a sending grant. Revoke ClientSphere at myaccount.google.com/permissions and reconnect.",
  denied: "Gmail connect was cancelled.",
};

export default function EmailSettingsPage() {
  const { data: settings, isLoading } = useEmailSettings();
  const update = useUpdateEmailSettings();
  const [form, setForm] = useState({
    from_address: "",
    inbound_address: "",
    provider: "resend" as "resend" | "gmail",
    resend_api_key: "",
    smtp_password: "",
    webhook_secret: "",
  });
  const [saved, setSaved] = useState(false);
  const [savedDialog, setSavedDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectNotice, setConnectNotice] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const canManage = useCanManageSettings();
  const connectToken = useGmailConnectToken();
  const disconnectGmail = useGmailDisconnect();

  // Landing back from Google carries ?gmail_connected=1 or ?gmail_error=…
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const err = q.get("gmail_error");
    if (q.get("gmail_connected")) {
      setConnectNotice("Gmail connected — workspace sends now go out as the connected address.");
    } else if (err) {
      setConnectError(GMAIL_CONNECT_ERRORS[err] ?? `Gmail connect failed (${err}). Try again.`);
    }
    if (q.get("gmail_connected") || err) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      from_address: settings?.from_address ?? "",
      inbound_address: settings?.inbound_address ?? "",
      provider: settings?.provider ?? "resend",
    }));
  }, [settings]);

  if (!canManage) return <ManagerOnlyNotice title="Email Settings" />;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Email Settings</h1>
        <div className="card p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const hasKey = settings?.resend_api_key_set ?? false;
  const hasSmtpPassword = settings?.smtp_password_set ?? false;
  const hasSecret = settings?.webhook_secret_set ?? false;
  const isGmail = form.provider === "gmail";
  const gmailConnected = settings?.gmail_connected ?? false;
  const gmailNeedsReconnect = settings?.gmail_needs_reconnect ?? false;

  const startGmailConnect = async () => {
    setError(null);
    try {
      const { connect_token } = await connectToken.mutateAsync();
      window.location.href = `/auth/google_connect?connect_token=${encodeURIComponent(connect_token)}`;
    } catch (e) {
      setError(errMessage(e, "Could not start Gmail connect."));
    }
  };

  const handleSave = async () => {
    setError(null);
    const payload: Record<string, unknown> = {
      from_address: form.from_address.trim() || null,
      inbound_address: form.inbound_address.trim() || null,
      provider: form.provider,
    };
    if (!isGmail && form.resend_api_key) payload.resend_api_key = form.resend_api_key;
    if (!isGmail && form.webhook_secret) payload.webhook_secret = form.webhook_secret;
    if (isGmail && form.smtp_password) payload.smtp_password = form.smtp_password;
    try {
      await update.mutateAsync(payload);
      setForm((f) => ({ ...f, resend_api_key: "", smtp_password: "", webhook_secret: "" }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setSavedDialog(true);
    } catch (e) {
      setError(errMessage(e, "Could not save email settings."));
    }
  };

  const copyUrl = async () => {
    if (!settings?.webhook_url) return;
    await navigator.clipboard.writeText(settings.webhook_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href="/settings"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Email Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Sending provider for this workspace — credentials are stored encrypted and never returned.
        </p>
      </div>

      <EmailSetupBanner showLink={false} />

      {connectNotice && (
        <NoticeBanner message={connectNotice} onDismiss={() => setConnectNotice(null)} />
      )}
      {connectError && <FormError message={connectError} />}

      <div className="card p-6 space-y-5">
        <FormError message={error} />

        <div role="radiogroup" aria-label="Sending provider">
          <p className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Provider</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
{(
                [
                { value: "resend", title: "Resend", hint: "API delivery with open/click tracking." },
                { value: "gmail", title: "Gmail", hint: "Connect a Gmail account; sends via Google API." },
                ] as const
              ).map((option) => {
              const selected = form.provider === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setForm({ ...form, provider: option.value })}
                  className={`text-left rounded-[var(--radius-md)] border px-3.5 py-3 transition-colors ${
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)] hover:border-[var(--text-tertiary)]"
                  }`}
                >
                  <span className="block text-sm font-medium text-[var(--text-primary)]">{option.title}</span>
                  <span className="block text-xs text-[var(--text-secondary)] mt-0.5">{option.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="email-from" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            From address
          </label>
          <input
            id="email-from"
            value={form.from_address}
            onChange={(e) => setForm({ ...form, from_address: e.target.value })}
            placeholder={isGmail ? "you@gmail.com" : "you@your-domain.com"}
            autoComplete="off"
            className="input"
          />
          <p className="text-xs text-[var(--text-secondary)] mt-1.5">
            {isGmail
              ? "Must be the Gmail (or Workspace) address you sign into SMTP with, or one of its verified Send As aliases."
              : "Falls back to the server default when blank. Use an address on a domain you verified in Resend."}
          </p>
        </div>

        <div>
          <label htmlFor="email-inbound" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Inbound address
          </label>
          <input
            id="email-inbound"
            value={form.inbound_address}
            onChange={(e) => setForm({ ...form, inbound_address: e.target.value })}
            placeholder="replies@yourdomain.com"
            autoComplete="off"
            className="input"
          />
          <p className="text-xs text-[var(--text-secondary)] mt-1.5">
            Replies mailed here land in the Inbox and link to the sending contact. With Resend,
            point your receiving domain at this address; with Gmail, auto-forward to it
            (or poll the inbox directly on self-hosted deploys).
          </p>
        </div>

        {isGmail ? (
          <>
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
              {gmailConnected && !gmailNeedsReconnect ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-40">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Connected as {settings?.gmail_address ?? "Gmail"}
                      <span className="badge badge-success ml-2 align-middle">Connected</span>
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Sends go through the Gmail API, so this works on any host —
                      no open SMTP ports needed. Everyone in the workspace sends as
                      this address.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void disconnectGmail.mutateAsync().catch((e: unknown) => setError(errMessage(e, "Could not disconnect Gmail.")))}
                    disabled={disconnectGmail.isPending}
                    className="btn-secondary text-sm"
                  >
                    {disconnectGmail.isPending ? "Disconnecting…" : "Disconnect"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-40">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {gmailNeedsReconnect ? "Reconnect Gmail" : "Connect a Gmail account"}
                      {gmailNeedsReconnect && (
                        <span className="badge badge-warning ml-2 align-middle">Needs reconnect</span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {gmailNeedsReconnect
                        ? "Google rejected the stored grant (password changed or access revoked). Reconnect to resume sending."
                        : "One owner connects the company Gmail once — the whole workspace then sends as it, over the Gmail API."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void startGmailConnect()}
                    disabled={connectToken.isPending}
                    className="btn-primary text-sm"
                  >
                    {connectToken.isPending ? "Connecting…" : gmailNeedsReconnect ? "Reconnect" : "Connect Gmail"}
                  </button>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="email-smtp-password" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Gmail app password
                {hasSmtpPassword && !form.smtp_password && (
                  <span className="badge badge-success ml-2 align-middle">Saved</span>
                )}
              </label>
              <input
                id="email-smtp-password"
                type="password"
                value={form.smtp_password}
                onChange={(e) => setForm({ ...form, smtp_password: e.target.value })}
                placeholder={hasSmtpPassword ? "••••••••  (leave blank to keep current password)" : "xxxx xxxx xxxx xxxx"}
                autoComplete="off"
                className="input"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                Optional SMTP fallback for self-hosted deploys with open submission
                ports (Google Account → Security → App passwords). Not needed when
                Gmail is connected above — and SMTP ports 25/465/587 are blocked on
                Render&apos;s free tier.
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="email-key" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Resend API key
                {hasKey && !form.resend_api_key && (
                  <span className="badge badge-success ml-2 align-middle">Saved</span>
                )}
              </label>
              <input
                id="email-key"
                type="password"
                value={form.resend_api_key}
                onChange={(e) => setForm({ ...form, resend_api_key: e.target.value })}
                placeholder={hasKey ? "••••••••  (leave blank to keep current key)" : "re_…"}
                autoComplete="off"
                className="input"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                Get a key at{" "}
                <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--text-primary)]">
                  resend.com/api-keys
                </a>
                . Without a key, outbound mail is kept as drafts. SMTP ports 25/465/587
                are blocked on Render free tier, so Resend (HTTP API) is the recommended
                path.
              </p>
            </div>

            <div>
              <label htmlFor="email-webhook-secret" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Webhook signing secret
                {hasSecret && !form.webhook_secret && (
                  <span className="badge badge-success ml-2 align-middle">Saved</span>
                )}
              </label>
              <input
                id="email-webhook-secret"
                type="password"
                value={form.webhook_secret}
                onChange={(e) => setForm({ ...form, webhook_secret: e.target.value })}
                placeholder={hasSecret ? "••••••••  (leave blank to keep current secret)" : "whsec_…"}
                autoComplete="off"
                className="input"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                From your Resend webhook&apos;s signing secret. Enables delivered/opened tracking.
              </p>
            </div>
          </>
        )}

        {!isGmail && settings?.webhook_url && (
          <div>
            <p className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Webhook URL — paste this into Resend
            </p>
            <div className="flex items-center gap-2">
              <code className="input flex-1 truncate text-xs">{settings.webhook_url}</code>
              <button onClick={() => void copyUrl()} className="btn-secondary text-sm shrink-0">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5">
              Resend can&apos;t reach localhost — use a tunnel (e.g. cloudflared) for local testing.
            </p>
          </div>
        )}

        <button
          onClick={() => void handleSave()}
          disabled={update.isPending}
          className="btn-primary text-sm"
        >
          {update.isPending ? "Saving…" : saved ? "Saved ✓" : "Save settings"}
        </button>
      </div>

      <ResultModal
        open={savedDialog}
        onClose={() => setSavedDialog(false)}
        tone="success"
        title="Email settings saved"
        message="New sends will use these credentials. Existing drafts keep their recorded sender."
      />
    </div>
  );
}
