"use client";

import { useState } from "react";
import { useEmails, useRedeliverEmail, useUpdateEmail } from "@/hooks/use-emails";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Field, FormError } from "@/components/forms/fields";
import { EmailSetupBanner, EmailSetupModal } from "@/components/settings/email-setup-nudge";
import { Modal, ResultModal } from "@/components/ui/modal";
import { errMessage } from "@/lib/error";
import { Mail, RotateCcw } from "lucide-react";

interface OutboxEmail {
  id: string;
  subject?: string | null;
  body?: string | null;
  from_address?: string | null;
  to_addresses?: string[] | null;
  cc_addresses?: string[] | null;
  bcc_addresses?: string[] | null;
  status?: string | null;
  created_at: string;
  sent_at?: string | null;
}

const splitAddrs = (s: string) =>
  s.split(",").map((x) => x.trim()).filter((x) => x !== "");

// Retry goes straight to the provider, which rejects a send with no "to".
const hasRecipient = (e: OutboxEmail) => (e.to_addresses ?? []).length > 0;

function EmailDetailModal({
  email,
  onClose,
  onRetry,
  onSaved,
  retrying,
}: {
  email: OutboxEmail;
  onClose: () => void;
  onRetry: (id: string) => void;
  onSaved: () => void;
  retrying: boolean;
}) {
  const update = useUpdateEmail();
  const [error, setError] = useState<string | null>(null);
  const [to, setTo] = useState((email.to_addresses ?? []).join(", "));
  const [cc, setCc] = useState((email.cc_addresses ?? []).join(", "));
  const [bcc, setBcc] = useState((email.bcc_addresses ?? []).join(", "));
  const [subject, setSubject] = useState(email.subject ?? "");
  const [body, setBody] = useState(email.body ?? "");
  const editable = email.status === "draft" || email.status === "failed";

  const saveChanges = async (): Promise<boolean> => {
    setError(null);
    try {
      await update.mutateAsync({
        id: email.id,
        to_addresses: splitAddrs(to),
        cc_addresses: splitAddrs(cc),
        bcc_addresses: splitAddrs(bcc),
        subject: subject.trim(),
        body,
      });
      return true;
    } catch (e) {
      setError(errMessage(e, "Could not save the email."));
      return false;
    }
  };

  const saveAndClose = async () => {
    if (await saveChanges()) {
      onClose();
      onSaved();
    }
  };

  const saveAndRetry = async () => {
    if (await saveChanges()) {
      onRetry(email.id);
      onClose();
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editable ? (email.status === "failed" ? "Fix and resend" : "Edit draft") : email.subject || "Email"}
      description={(email.to_addresses ?? []).join(", ")}
    >
      <div className="space-y-3">
        <FormError message={error} />
        <p className="text-xs text-[var(--text-tertiary)]">
          From {email.from_address || "—"} · {new Date(email.sent_at ?? email.created_at).toLocaleString()} ·{" "}
          <span className={`badge ${email.status ? STATUS_BADGE[email.status] ?? "badge-neutral" : "badge-neutral"}`}>
            {email.status ?? "draft"}
          </span>
        </p>
        {editable ? (
          <>
            <Field label="To" htmlFor="outbox-to">
              <input
                id="outbox-to"
                className="input"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="a@example.com, b@example.com"
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Cc" htmlFor="outbox-cc">
                <input id="outbox-cc" className="input" value={cc} onChange={(e) => setCc(e.target.value)} />
              </Field>
              <Field label="Bcc" htmlFor="outbox-bcc">
                <input id="outbox-bcc" className="input" value={bcc} onChange={(e) => setBcc(e.target.value)} />
              </Field>
            </div>
            <Field label="Subject" htmlFor="outbox-subject">
              <input
                id="outbox-subject"
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Field>
            <Field label="Body" htmlFor="outbox-body">
              <textarea
                id="outbox-body"
                className="input resize-y"
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </Field>
            <div className="flex gap-2">
              <button
                onClick={() => void saveAndClose()}
                disabled={update.isPending || !subject.trim()}
                className="btn-primary text-sm"
              >
                {update.isPending ? "Saving…" : "Save changes"}
              </button>
              <button
                onClick={() => void saveAndRetry()}
                disabled={update.isPending || retrying || !subject.trim() || splitAddrs(to).length === 0}
                className="btn-secondary text-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {update.isPending || retrying ? "Sending…" : "Save & retry"}
              </button>
            </div>
          </>
        ) : (
          <>
            {(email.cc_addresses ?? []).length > 0 && (
              <p className="text-xs text-[var(--text-tertiary)]">Cc: {(email.cc_addresses ?? []).join(", ")}</p>
            )}
            {(email.bcc_addresses ?? []).length > 0 && (
              <p className="text-xs text-[var(--text-tertiary)]">Bcc: {(email.bcc_addresses ?? []).join(", ")}</p>
            )}
            <p className="text-sm whitespace-pre-wrap">{email.body || "—"}</p>
          </>
        )}
      </div>
    </Modal>
  );
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "opened", label: "Opened" },
  { value: "failed", label: "Failed" },
];

const STATUS_BADGE: Record<string, string> = {
  draft: "badge-neutral",
  sent: "badge-info",
  delivered: "badge-success",
  opened: "badge-success",
  failed: "badge-danger",
};

export default function OutboxPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [actionError, setActionError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryNotice, setRetryNotice] = useState<{ title: string; message: string } | null>(null);
  const [selected, setSelected] = useState<OutboxEmail | null>(null);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useEmails({
    status: status || undefined,
    page,
    per_page: perPage,
  });
  const redeliver = useRedeliverEmail();
  const rows = ((data as unknown as { data?: OutboxEmail[] })?.data ?? []);
  const meta = (data as unknown as { meta?: { total_count: number; total_pages: number; current_page: number } })?.meta;

  const retry = async (id: string) => {
    setActionError(null);
    setRetryingId(id);
    try {
      const email = await redeliver.mutateAsync(id);
      const recipients = ((email as unknown as { to_addresses?: string[] } | undefined)?.to_addresses ?? []).join(", ");
      setRetryNotice({
        title: (email as unknown as { status?: string } | undefined)?.status === "sent"
          ? "Email sent"
          : "Retry finished",
        message:
          (email as unknown as { status?: string } | undefined)?.status === "sent"
            ? `Delivered to ${recipients || "the recipient"}.`
            : "The provider did not confirm delivery, so it is still in the Outbox for review.",
      });
    } catch (e) {
      setActionError(errMessage(e, "Could not redeliver the email."));
    } finally {
      setRetryingId(null);
    }
  };

  const columns: DataTableColumn<OutboxEmail>[] = [
    {
      key: "to",
      label: "To",
      render: (e) => (
        <span className="text-[var(--text-secondary)]">{(e.to_addresses ?? []).join(", ") || "—"}</span>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (e) => (
        <span className="font-medium text-[var(--text-primary)]">{e.subject || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (e) => (
        <span className={`badge ${e.status ? STATUS_BADGE[e.status] ?? "badge-neutral" : "badge-neutral"}`}>
          {e.status ?? "draft"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (e) => (
        <span className="text-[var(--text-secondary)]">
          {new Date(e.sent_at ?? e.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (e) => {
        const retryable = e.status === "draft" || e.status === "failed";
        if (!retryable) return <span />;
        if (!hasRecipient(e)) {
          return (
            <button
              disabled
              className="btn-secondary text-sm"
              title="Add a recipient before retrying"
              aria-label="Retry unavailable — no recipient"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </button>
          );
        }
        return (
          <button
            onClick={(ev) => {
              ev.stopPropagation();
              void retry(e.id);
            }}
            disabled={retryingId === e.id}
            className="btn-secondary text-sm"
            aria-label={`Retry ${e.subject ?? "email"}`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {retryingId === e.id ? "Retrying…" : "Retry"}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Mail className="h-5 w-5 text-[var(--text-tertiary)]" />
          Outbox
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Every outbound email — drafts waiting on a provider, sent mail, and failures to retry.
        </p>
      </div>

      <FormError message={actionError} />

      <EmailSetupBanner />

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input w-auto text-sm"
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        onRowClick={(e) => setSelected(e)}
        minWidth="min-w-[720px]"
        empty={
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              {status ? `No ${status} emails` : "No emails yet — send one from a deal page"}
            </p>
          </div>
        }
        page={meta?.current_page ?? page}
        totalPages={meta?.total_pages ?? 0}
        total={meta?.total_count ?? 0}
        perPage={perPage}
        onPerPage={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        onPage={setPage}
      />

      {selected && (
        <EmailDetailModal
          key={selected.id}
          email={selected}
          onClose={() => setSelected(null)}
          onRetry={(id) => void retry(id)}
          onSaved={() => setSaved(true)}
          retrying={retryingId === selected.id}
        />
      )}

      <ResultModal
        open={saved}
        onClose={() => setSaved(false)}
        tone="success"
        title="Email saved"
        message="Your changes to this email were saved."
      />

      <ResultModal
        open={!!retryNotice}
        onClose={() => setRetryNotice(null)}
        tone="success"
        title={retryNotice?.title ?? ""}
        message={retryNotice?.message ?? ""}
      />

      <EmailSetupModal />
    </div>
  );
}
