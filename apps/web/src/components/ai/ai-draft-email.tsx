"use client";

import { useState } from "react";
import { useAiSettings, useDraftEmail } from "@/hooks/use-ai";
import { errMessage } from "@/lib/ai/error";
import { Sparkles, Copy, Check, RefreshCw, X } from "lucide-react";

const PURPOSES = ["follow-up", "introduction", "proposal", "check-in"];

export function AiDraftEmail({ contactId, dealId }: { contactId: string; dealId?: string }) {
  const { data: settings } = useAiSettings();
  const draftEmail = useDraftEmail();
  const [purpose, setPurpose] = useState("follow-up");
  const [text, setText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!settings?.enabled) return null;

  const generate = async () => {
    setError(null);
    try {
      const result = await draftEmail.mutateAsync({ contactId, purpose, dealId });
      setText(result.draft || "");
      setCopied(false);
    } catch (e) {
      setError(errMessage(e, "Could not draft the email."));
    }
  };

  const copy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--text-tertiary)]" />
          Draft Email
        </h2>
        {text && (
          <button onClick={() => setText(null)} className="btn-ghost text-xs" aria-label="Close draft">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {!text ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Generate a ready-to-send email from this contact&apos;s context.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="input w-auto text-sm"
              aria-label="Email purpose"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button onClick={generate} disabled={draftEmail.isPending} className="btn-primary text-sm">
              {draftEmail.isPending ? "Drafting…" : "Draft email"}
            </button>
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="input resize-y w-full text-sm font-mono"
            aria-label="Email draft"
          />
          <div className="flex gap-2">
            <button onClick={copy} className="btn-secondary text-sm">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={generate} disabled={draftEmail.isPending} className="btn-ghost text-sm">
              <RefreshCw className="h-3.5 w-3.5" />
              {draftEmail.isPending ? "Redrafting…" : "Regenerate"}
            </button>
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        </div>
      )}
    </div>
  );
}
