"use client";

import { useContact, useScoreContact } from "@/hooks/use-contacts";
import { NotesSection } from "@/components/shared/notes-section";
import { ContactTags } from "@/components/contacts/contact-tags";
import { AiDraftEmail } from "@/components/ai/ai-draft-email";
import { AiInsights } from "@/components/ai/ai-insights";

interface ContactData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: "lead" | "customer" | "churned" | null;
  lead_score: number;
  score_reasons: string[];
  created_at: string;
}

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useContact(params.id);
  const scoreContact = useScoreContact();
  const contact = data as unknown as ContactData | undefined;

  if (isLoading) return <div className="text-center py-8 text-sm text-[var(--text-secondary)]">Loading...</div>;
  if (!contact) return <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">Contact not found</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{contact.first_name} {contact.last_name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Info</h2>
          <dl className="space-y-3">
            <div><dt className="text-sm text-[var(--text-secondary)]">Email</dt><dd className="mt-1">{contact.email}</dd></div>
            <div><dt className="text-sm text-[var(--text-secondary)]">Phone</dt><dd className="mt-1">{contact.phone}</dd></div>
            <div><dt className="text-sm text-[var(--text-secondary)]">Status</dt><dd className="mt-1 capitalize">{contact.status ?? "lead"}</dd></div>
            <div><dt className="text-sm text-[var(--text-secondary)]">Lead Score</dt><dd className="mt-1">{contact.lead_score}</dd></div>
          </dl>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Lead Score Reasons</h2>
            <button
              onClick={() => scoreContact.mutate(contact.id)}
              disabled={scoreContact.isPending}
              className="btn-ghost text-xs border border-[var(--border)]"
            >
              {scoreContact.isPending ? "Scoring…" : "Re-score"}
            </button>
          </div>
          <ul className="space-y-2">
            {contact.score_reasons?.map((reason: string, index: number) => (
              <li key={index} className="text-sm text-[var(--text-primary)]">{reason}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AiDraftEmail contactId={contact.id} />
        <AiInsights recordType="Contact" recordId={contact.id} />
      </div>

      <ContactTags contactId={contact.id} />

      <NotesSection notableType="Contact" notableId={contact.id} />
    </div>
  );
}
