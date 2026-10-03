"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, ChevronDown, Undo2, X } from "lucide-react";
import { useActivities } from "@/hooks/use-activities";
import { useCompleteTaskWithUndo } from "@/hooks/use-complete-task";

interface DealTask {
  id: string;
  subject: string;
  description?: string | null;
  due_at?: string | null;
  completed_at?: string | null;
}

interface ActivitiesResponse {
  data: DealTask[];
  meta: { total_count: number };
}

function daysOverdue(dueAt: string): number {
  const ms = Date.now() - new Date(dueAt).getTime();
  // Round up: anything past due reads as at least "1d late", never "0d late".
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function DealOverdueTasks({ dealId }: { dealId: string }) {
  const [collapsed, setCollapsed] = useState<boolean | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { complete, undo, completingId, recentlyCompleted, failed, dismissFailure, announcement, isPending } =
    useCompleteTaskWithUndo([
      ["activities"],
      ["due-tasks"],
      ["deals", dealId, "summary"],
      ["deals", "attention"],
    ]);
  const { data, isLoading, isError, refetch } = useActivities({
    deal_id: dealId,
    kind: "task",
    overdue: "true",
    sort: "due_at",
    direction: "asc",
    per_page: showAll ? 100 : 10,
  });

  const resp = data as unknown as ActivitiesResponse | undefined;
  const tasks = resp?.data ?? [];
  const total = resp?.meta?.total_count ?? tasks.length;
  const open = collapsed ?? true;

  if (isLoading) {
    return (
      <div className="card p-6" id="deal-tasks">
        <div className="h-5 w-48 bg-[var(--bg-elevated)] rounded animate-pulse mb-3" />
        <div className="h-4 w-full bg-[var(--bg-elevated)] rounded animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card p-6" id="deal-tasks">
        <p className="text-sm text-[var(--text-secondary)]">
          Could not load overdue tasks.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasTasks = tasks.length > 0 || recentlyCompleted.length > 0;

  const toggleOpen = () => setCollapsed((c) => !(c ?? true));

  return (
    <div className="card p-6" id="deal-tasks">
      <span aria-live="polite" role="status" className="sr-only">
        {announcement}
      </span>
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >
        <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--danger)]" />
        <span className="text-lg font-semibold">Overdue tasks</span>
        {total > 0 && <span className="badge badge-danger text-xs tabular-nums">{total}</span>}
        <ChevronDown
          className={`ml-auto h-4 w-4 text-[var(--text-tertiary)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`collapse-grid${open ? " open" : ""}`}>
        <div className="collapse-inner">
          {!hasTasks ? (
            <p className="text-sm text-[var(--text-secondary)]">
              All clear — no overdue tasks for this deal.
            </p>
          ) : (
          <>
          <p className="text-sm text-[var(--text-secondary)]">
            Tick a task done, or open it for full details.
          </p>
          <ul className="mt-4 divide-y divide-[var(--border-subtle)]">
            {tasks.map((t) => {
              const overdueDays = t.due_at ? daysOverdue(t.due_at) : 0;
              const completing = completingId === t.id;
              const failedHere = failed?.id === t.id && failed.action === "complete";
              return (
                <li key={t.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => complete(t)}
                    disabled={completing || isPending}
                    aria-label={`Mark ${t.subject} complete`}
                    className="h-6 w-6 shrink-0 rounded-full border border-[var(--border)] flex items-center justify-center text-transparent hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/activities/${t.id}`}
                    className="flex-1 min-w-0 block rounded-md px-2 -mx-2 py-1 hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-medium text-[var(--text-primary)] truncate">{t.subject}</span>
                      <span className="badge badge-danger text-xs shrink-0 tabular-nums">
                        {t.due_at ? new Date(t.due_at).toLocaleDateString() : "No date"}
                        {t.due_at ? ` · ${overdueDays}d late` : ""}
                      </span>
                    </span>
                    {t.description && (
                      <span className="mt-0.5 block text-sm text-[var(--text-secondary)] line-clamp-2">
                        {t.description}
                      </span>
                    )}
                  </Link>
                  </div>
                  {failedHere && (
                    <p className="mt-1 pl-7 text-xs text-[var(--danger-ink)]">
                      Could not mark complete — try again.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          {recentlyCompleted.length > 0 && (
            <ul className={tasks.length > 0 ? "mt-2 border-t border-[var(--border-subtle)]" : ""}>
              {recentlyCompleted.map((t) => {
                const undoing = completingId === t.id;
                const failedHere = failed?.id === t.id && failed.action === "undo";
                return (
                  <li key={t.id} className="py-3">
                    <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 rounded-full bg-[var(--success)] flex items-center justify-center text-white"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1 min-w-0 text-sm text-[var(--text-secondary)] line-through truncate">
                      {t.subject}
                    </span>
                    <button
                      type="button"
                      onClick={() => undo(t.id)}
                      disabled={undoing || isPending}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors shrink-0 disabled:opacity-50"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                      Undo
                    </button>
                    {failedHere && (
                      <button
                        type="button"
                        onClick={() => dismissFailure(t.id)}
                        aria-label={`Dismiss failed undo for ${t.subject}`}
                        className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    </div>
                    {failedHere && (
                      <p className="mt-1 pl-7 text-xs text-[var(--danger-ink)]">
                        Could not reopen — try again.
                      </p>
                    )}
                    {!failedHere && (
                      <span aria-hidden="true" className="undo-countdown mt-2 ml-7 block h-0.5 rounded-full bg-[var(--success)]/50" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {total > 10 && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="mt-3 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
            >
              {showAll ? "Show less" : `Show all ${total}`}
            </button>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}
