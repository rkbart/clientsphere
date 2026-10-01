"use client";

import { useDealSummary } from "@/hooks/use-deals";
import { FileText } from "lucide-react";

export function DealSummary({ dealId }: { dealId: string }) {
  const { data, isLoading } = useDealSummary(dealId);
  const summary = (data as unknown as { summary?: string; stale?: boolean } | undefined);

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="h-5 w-40 bg-[var(--bg-elevated)] rounded animate-pulse mb-3" />
        <div className="h-4 w-full bg-[var(--bg-elevated)] rounded animate-pulse" />
      </div>
    );
  }
  if (!summary?.summary) return null;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-[var(--text-tertiary)]" />
        Deal Summary
        {summary.stale && <span className="badge badge-warning text-xs">Stale</span>}
      </h2>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-secondary)]">
        {summary.summary}
      </p>
    </div>
  );
}
