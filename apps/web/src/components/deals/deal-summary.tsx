"use client";

import { useDealSummary } from "@/hooks/use-deals";
import { FileText } from "lucide-react";

interface SummaryFacts {
  position?: {
    stage?: string | null;
    stage_color?: string | null;
    amount?: string | null;
    weighted?: string | null;
    probability?: number | null;
  } | null;
  close?: { tone?: string | null; label?: string | null } | null;
  activity?: { tone?: string | null; label?: string | null; overdue_tasks?: number | null } | null;
}

interface SummaryData {
  summary?: string;
  stale?: boolean;
  facts?: SummaryFacts | null;
}

const TONE_TEXT: Record<string, string> = {
  bad: "text-[var(--danger)]",
  warn: "text-[var(--warning)]",
  ok: "text-[var(--text-primary)]",
  muted: "text-[var(--text-secondary)]",
};

function FactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

export function DealSummary({ dealId }: { dealId: string }) {
  const { data, isLoading } = useDealSummary(dealId);
  const summary = (data as unknown as SummaryData | undefined);

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="h-5 w-40 bg-[var(--bg-elevated)] rounded animate-pulse mb-3" />
        <div className="h-4 w-full bg-[var(--bg-elevated)] rounded animate-pulse" />
      </div>
    );
  }
  if (!summary?.facts) return null;

  const { position, close, activity } = summary.facts;
  const tone = (t?: string | null) => TONE_TEXT[t ?? "muted"] ?? TONE_TEXT.muted;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <FileText className="h-4 w-4 text-[var(--text-tertiary)]" />
        Deal Summary
        {summary.stale && <span className="badge badge-warning text-xs">Stale</span>}
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <FactRow label="Position">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {position?.stage && (
              <span
                className="badge badge-neutral"
                style={
                  position.stage_color
                    ? { backgroundColor: `${position.stage_color}1a`, color: position.stage_color }
                    : undefined
                }
              >
                {position.stage}
              </span>
            )}
            {position?.amount && <span className="tabular-nums font-medium">{position.amount}</span>}
            {position?.weighted && position.probability != null && (
              <span className="text-[var(--text-secondary)] tabular-nums">
                {position.probability}% · ≈{position.weighted}
              </span>
            )}
          </span>
        </FactRow>
        {close && (
          <FactRow label="Close date">
            <span className={tone(close.tone)}>{close.label || "—"}</span>
          </FactRow>
        )}
        {activity && (
          <FactRow label="Last touch">
            <span className={tone(activity.tone)}>{activity.label || "—"}</span>
          </FactRow>
        )}
        {(activity?.overdue_tasks ?? 0) > 0 && (
          <FactRow label="Overdue tasks">
            <span className="text-[var(--danger)] tabular-nums">
              {activity?.overdue_tasks} need{activity?.overdue_tasks === 1 ? "s" : ""} attention
            </span>
          </FactRow>
        )}
      </dl>
    </div>
  );
}
