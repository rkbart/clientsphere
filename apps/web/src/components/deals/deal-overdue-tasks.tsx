"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { useActivities } from "@/hooks/use-activities";

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
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function DealOverdueTasks({ dealId }: { dealId: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useActivities({
    deal_id: dealId,
    kind: "task",
    overdue: "true",
    sort: "due_at",
    direction: "asc",
    per_page: 10,
  });

  const resp = data as unknown as ActivitiesResponse | undefined;
  const tasks = resp?.data ?? [];
  const total = resp?.meta?.total_count ?? tasks.length;

  if (isLoading) {
    return (
      <div className="card p-6" id="deal-tasks">
        <div className="h-5 w-48 bg-[var(--bg-elevated)] rounded animate-pulse mb-3" />
        <div className="h-4 w-full bg-[var(--bg-elevated)] rounded animate-pulse" />
      </div>
    );
  }

  if (tasks.length === 0) return null;

  return (
    <div className="card p-6" id="deal-tasks">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >
        <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--danger)]" />
        <span className="text-lg font-semibold">Overdue tasks</span>
        <span className="badge badge-danger text-xs tabular-nums">{total}</span>
        <ChevronDown
          className={`ml-auto h-4 w-4 text-[var(--text-tertiary)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Tasks linked to this deal that are past due. Open one to see details even if the title is vague.
          </p>
          <ul className="mt-4 divide-y divide-[var(--border-subtle)]">
        {tasks.map((t) => {
          const overdueDays = t.due_at ? daysOverdue(t.due_at) : 0;
          return (
            <li key={t.id} className="py-3 first:pt-0 last:pb-0">
              <Link
                href={`/activities/${t.id}`}
                className="block rounded-md px-2 -mx-2 py-1 hover:bg-[var(--bg-elevated)] transition-colors"
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
            </li>
          );
        })}
      </ul>
        </>
      )}
    </div>
  );
}
