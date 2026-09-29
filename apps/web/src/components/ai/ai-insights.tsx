"use client";

import { useState } from "react";
import { useAiSettings, useSuggestNextAction, useSummarizeDeal } from "@/hooks/use-ai";
import { errMessage } from "@/lib/ai/error";
import { Sparkles, Lightbulb, FileText } from "lucide-react";

export function AiInsights({ recordType, recordId }: { recordType: string; recordId: string }) {
  const { data: settings } = useAiSettings();
  const suggest = useSuggestNextAction();
  const summarize = useSummarizeDeal();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!settings?.enabled) return null;

  const runSuggest = async () => {
    setError(null);
    try {
      const result = await suggest.mutateAsync({ recordType, recordId });
      setSuggestion(result.suggestion || null);
    } catch (e) {
      setError(errMessage(e, "Could not suggest a next action."));
    }
  };

  const runSummarize = async () => {
    setError(null);
    try {
      const result = await summarize.mutateAsync(recordId);
      setSummary(result.summary || null);
    } catch (e) {
      setError(errMessage(e, "Could not summarize this deal."));
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-[var(--text-tertiary)]" />
        AI Insights
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" />
              Next action
            </p>
            <button onClick={runSuggest} disabled={suggest.isPending} className="btn-ghost text-xs border border-[var(--border)]">
              {suggest.isPending ? "Thinking…" : "Suggest"}
            </button>
          </div>
          {suggestion && (
            <p className="mt-2 text-sm bg-[var(--bg-elevated)] rounded-[var(--radius-md)] px-3 py-2.5 leading-relaxed">
              {suggestion}
            </p>
          )}
        </div>

        {recordType === "Deal" && (
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Deal summary
              </p>
              <button onClick={runSummarize} disabled={summarize.isPending} className="btn-ghost text-xs border border-[var(--border)]">
                {summarize.isPending ? "Summarizing…" : "Summarize"}
              </button>
            </div>
            {summary && (
              <p className="mt-2 text-sm bg-[var(--bg-elevated)] rounded-[var(--radius-md)] px-3 py-2.5 leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            )}
          </div>
        )}

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </div>
    </div>
  );
}
