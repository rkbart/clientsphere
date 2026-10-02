"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { useActivities } from "@/hooks/use-activities";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface CalendarActivity {
  id: string;
  subject: string;
  kind: string;
  due_at: string | null;
  completed_at: string | null;
}

const KIND_DOT: Record<string, string> = {
  call: "bg-blue-500",
  meeting: "bg-violet-500",
  task: "bg-amber-500",
  email: "bg-emerald-500",
  other: "bg-stone-400",
};

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const monthStart = startOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });

  const { data } = useActivities({
    due_from: gridStart.toISOString(),
    due_to: gridEnd.toISOString(),
    per_page: 100,
  });
  const activities = ((data as unknown as { data?: CalendarActivity[] })?.data ?? []).filter(
    (a) => a.due_at,
  );

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarActivity[]>();
    for (const activity of activities) {
      const key = format(new Date(activity.due_at as string), "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(activity);
      map.set(key, list);
    }
    return map;
  }, [activities]);

  const days = useMemo(() => {
    const list: Date[] = [];
    for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) list.push(d);
    return list;
  }, [cursor]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Activities and tasks by due date
          </p>
        </div>
        <Link href="/activities/new" className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Log Activity
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-sm font-semibold">{format(cursor, "MMMM yyyy")}</h2>
          <div className="flex gap-1">
            <button
              onClick={() => setCursor(subMonths(cursor, 1))}
              className="btn-ghost p-2"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setCursor(new Date())} className="btn-ghost text-sm">
              Today
            </button>
            <button
              onClick={() => setCursor(addMonths(cursor, 1))}
              className="btn-ghost p-2"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className="grid grid-cols-7"
          role="grid"
          aria-label={`${format(cursor, "MMMM yyyy")} calendar`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setCursor(subMonths(cursor, 1));
            if (e.key === "ArrowRight") setCursor(addMonths(cursor, 1));
          }}
        >
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider text-center border-b border-[var(--border-subtle)]"
            >
              {d}
            </div>
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const items = byDay.get(key) ?? [];
            const inMonth = isSameMonth(day, cursor);
            return (
              <div
                key={key}
                role="gridcell"
                aria-label={`${format(day, "MMMM d")}, ${items.length} activities`}
                className={`min-h-[5.5rem] p-1.5 border-b border-r border-[var(--border-subtle)] [&:nth-child(7n+1)]:border-l-0 ${
                  inMonth ? "" : "bg-[var(--bg-elevated)]/50"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full tabular-nums ${
                    isToday(day)
                      ? "bg-[var(--accent)] text-[var(--text-inverse)] font-semibold"
                      : inMonth
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  {items.slice(0, 3).map((a) => (
                    <Link
                      key={a.id}
                      href={`/activities/${a.id}`}
                      title={a.subject}
                      className={`flex items-center gap-1.5 text-xs px-1.5 py-0.5 rounded truncate hover:bg-[var(--bg-elevated)] ${
                        a.completed_at
                          ? "line-through text-[var(--text-tertiary)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${KIND_DOT[a.kind] ?? KIND_DOT.other}`}
                      />
                      <span className="truncate">{a.subject}</span>
                    </Link>
                  ))}
                  {items.length > 3 && (
                    <span className="block text-[11px] text-[var(--text-tertiary)] px-1.5">
                      +{items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
