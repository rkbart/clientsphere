"use client";

import { useState } from "react";
import Link from "next/link";
import { useEmails, useMarkReadEmail } from "@/hooks/use-emails";
import { EmailDetailModal } from "@/app/(dashboard)/emails/page";
import { Inbox, Send } from "lucide-react";

interface ThreadEmail {
  id: string;
  subject?: string | null;
  body?: string | null;
  from_address?: string | null;
  to_addresses?: string[] | null;
  cc_addresses?: string[] | null;
  bcc_addresses?: string[] | null;
  status?: string | null;
  direction?: string | null;
  read_at?: string | null;
  created_at: string;
  sent_at?: string | null;
}

// Mail thread on the contact detail page: every inbound reply and outbound
// send with this contact, newest first. Opening an unread reply marks it
// read (badge and Inbox stay in sync through shared query keys).
export function ContactMailSection({ contactId }: { contactId: string }) {
  const { data, isLoading } = useEmails({ contact_id: contactId, per_page: 10 });
  const markRead = useMarkReadEmail();
  const [selected, setSelected] = useState<ThreadEmail | null>(null);
  const rows = ((data as unknown as { data?: ThreadEmail[] })?.data ?? []);

  const openEmail = (email: ThreadEmail) => {
    setSelected(email);
    if (email.direction === "inbound" && !email.read_at) {
      void markRead.mutateAsync(email.id).catch(() => {});
    }
  };

  if (!isLoading && rows.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Mail</h2>
        <Link href="/emails" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          Open mailbox
        </Link>
      </div>
      {isLoading ? (
        <p className="text-sm text-[var(--text-tertiary)]">Loading…</p>
      ) : (
        <ul className="divide-y divide-[var(--border-subtle)]">
          {rows.map((e) => {
            const inbound = e.direction === "inbound";
            const unread = inbound && !e.read_at;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => openEmail(e)}
                  className="flex w-full items-center gap-3 py-2.5 text-left"
                >
                  <span className="shrink-0 text-[var(--text-tertiary)]" aria-hidden="true">
                    {inbound ? <Inbox className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm ${unread ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                      {e.subject || "—"}
                    </span>
                    <span className="block truncate text-xs text-[var(--text-tertiary)]">
                      {inbound ? e.from_address : (e.to_addresses ?? []).join(", ")} ·{" "}
                      {new Date(e.sent_at ?? e.created_at).toLocaleDateString()}
                    </span>
                  </span>
                  {unread && (
                    <span aria-label="Unread" className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {selected && (
        <EmailDetailModal
          key={selected.id}
          email={selected}
          onClose={() => setSelected(null)}
          onRetry={() => {}}
          onSaved={() => {}}
          retrying={false}
        />
      )}
    </div>
  );
}
