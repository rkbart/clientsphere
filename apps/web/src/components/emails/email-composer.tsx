"use client";

import { useEffect, useState } from "react";
import { useCreateEmail, useDeliverEmail, useEmailTemplates } from "@/hooks/use-emails";
import { useContact } from "@/hooks/use-contacts";
import { errMessage } from "@/lib/error";
import { Check, Copy, Mail, Save, Send } from "lucide-react";

const splitAddrs = (s: string) =>
  s.split(",").map((x) => x.trim()).filter((x) => x !== "");

export function EmailComposer({ contactId, dealId }: { contactId: string; dealId?: string }) {
  const { data: templates } = useEmailTemplates(contactId);
  const { data: contactData } = useContact(contactId);
  const contactEmail = (contactData as unknown as { email?: string } | undefined)?.email ?? "";
  const deliver = useDeliverEmail();
  const saveDraft = useCreateEmail();
  const [templateKey, setTemplateKey] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contactEmail && !to) setTo(contactEmail);
  }, [contactEmail, to]);

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
        to_addresses: splitAddrs(to),
        cc_addresses: splitAddrs(cc),
        bcc_addresses: splitAddrs(bcc),
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

  const draft = async () => {
    setError(null);
    setResult(null);
    try {
      await saveDraft.mutateAsync({
        contact_id: contactId,
        deal_id: dealId,
        direction: "outbound",
        status: "draft",
        subject: subject.trim(),
        body,
        to_addresses: splitAddrs(to),
        cc_addresses: splitAddrs(cc),
        bcc_addresses: splitAddrs(bcc),
      });
      setResult("Saved to Outbox drafts.");
    } catch (e) {
      setError(errMessage(e, "Could not save the draft."));
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input w-full text-sm"
            placeholder="To — comma separated"
            aria-label="Recipients"
          />
          <input
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            className="input w-full text-sm"
            placeholder="Cc"
            aria-label="Cc recipients"
          />
          <input
            value={bcc}
            onChange={(e) => setBcc(e.target.value)}
            className="input w-full text-sm"
            placeholder="Bcc"
            aria-label="Bcc recipients"
          />
        </div>
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

        <div className="flex flex-wrap gap-2">
          <button
            onClick={send}
            disabled={deliver.isPending || !subject.trim() || !body.trim() || splitAddrs(to).length === 0}
            className="btn-primary text-sm"
          >
            <Send className="h-3.5 w-3.5" />
            {deliver.isPending ? "Sending…" : "Send email"}
          </button>
          <button
            onClick={() => void draft()}
            disabled={saveDraft.isPending || !subject.trim()}
            className="btn-secondary text-sm"
          >
            <Save className="h-3.5 w-3.5" />
            {saveDraft.isPending ? "Saving…" : "Save draft"}
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
