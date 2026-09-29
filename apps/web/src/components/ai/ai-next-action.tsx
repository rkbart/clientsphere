"use client";

import { useState } from "react";
import Link from "next/link";
import { useAiSettings, useSuggestNextAction } from "@/hooks/use-ai";
import { errMessage } from "@/lib/ai/error";
import { Sparkles, Lightbulb, ChevronRight } from "lucide-react";

export function AiNextAction({
  recordType,
  recordId,
  recordLabel,
  href,
}: {
  recordType: string;
  recordId: string;
  recordLabel?: string;
  href?: string;
}) {
  const { data: settings } = useAiSettings();
  const suggest = useSuggestNextAction();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!settings?.enabled) return null;

  const run = async () => {
    setError(null);
    try {
      const result = await suggest.mutateAsync({ recordType, recordId });
      setSuggestion(result.suggestion || null);
    } catch (e) {
      setError(errMessage(e, "Could not suggest a next action."));
    }
  };

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--text-tertiary)]" />
          Next best action
        </h2>
        {href && recordLabel && (
          <Link
            href={href}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-0.5 transition-colors"
          >
            {recordLabel} <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="p-5 space-y-3">
        {!suggestion ? (
          <>
            <p className="text-sm text-[var(--text-secondary)]">
              {recordLabel
                ? `Get an AI-suggested next step for "${recordLabel}".`
                : "Get an AI-suggested next step for your most urgent open deal."}
            </p>
            <button onClick={run} disabled={suggest.isPending} className="btn-primary text-sm">
              {suggest.isPending ? "Thinking…" : "Suggest next action"}
            </button>
          </>
        ) : (
          <p className="text-sm flex items-start gap-2 leading-relaxed">
            <Lightbulb className="h-4 w-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
            <span>{suggestion}</span>
          </p>
        )}
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </div>
    </div>
  );
}
