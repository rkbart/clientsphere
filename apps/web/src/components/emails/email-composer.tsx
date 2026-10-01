"use client";

import { useState } from "react";
import { useDeliverEmail, useEmailTemplates } from "@/hooks/use-emails";
import { errMessage } from "@/lib/ai/error";
import { Check, Copy, Mail, Send } from "lucide-react";

export function EmailComposer({ contactId, dealId }: { contactId: string; dealId?: string }) {
  const { data: templates } = useEmailTemplates(contactId);
  const deliver = useDeliverEmail();
  const [templateKey, setTemplateKey] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = (key: string) => {
    setTemplateKey(key);
    const t = (templates ?? []).find((x) => x.key === key);
    if (t) {
      setSubject(t.subject);
      setBody(t.body);
    }
    setResult(null);
    setError(null);
  };

  const send = async () => {
    setError(null);
    setResult(null);
    try {
      const email = await deliver.mutateAsync({
        contact_id: contactId,
        deal_id: dealId,
        subject: subject.trim(),
        body,
      });
      setResult(
        email.status === "sent"
          ? `Sent to ${(email.to_addresses ?? []).join(", ") || "contact"}.`
          : email.status === "draft"
            ? "Saved as draft — connect an email provider to deliver."
            : "Could not deliver — saved for review.",
      );
    } catch (e) {
      setError(errMessage(e, "Could not send the email."));
    }
  };

  const copy = async () => {
    if (!body) return;
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Mail className="h-4 w-4 text-[var(--text-tertiary)]" />
        Compose Email
      </h2>

      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">
          Pick a template, edit it, then send it to this contact.
        </p>
        <select
          value={templateKey}
          onChange={(e) => pick(e.target.value)}
          className="input w-auto text-sm"
          aria-label="Email template"
        >
          <option value="">Choose a template…</option>
          {(templates ?? []).map((t) => (
            <option key={t.key} value={t.key}>
              {t.name}
            </option>
          ))}
        </select>

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input w-full text-sm"
          placeholder="Subject"
          aria-label="Email subject"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="input resize-y w-full text-sm"
          placeholder="Write your message…"
          aria-label="Email body"
        />

        <div className="flex gap-2">
          <button
            onClick={send}
            disabled={deliver.isPending || !subject.trim() || !body.trim()}
            className="btn-primary text-sm"
          >
            <Send className="h-3.5 w-3.5" />
            {deliver.isPending ? "Sending…" : "Send email"}
          </button>
          <button onClick={copy} disabled={!body} className="btn-secondary text-sm">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {result && <p className="text-sm text-[var(--text-secondary)]">{result}</p>}
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </div>
    </div>
  );
}
