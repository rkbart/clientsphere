"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";
import { useDeal } from "@/hooks/use-deals";
import { persistFilters, readRememberedFilters } from "@/hooks/use-remembered-filters";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { useBulkCompleteActivities, useUpdateActivity } from "@/hooks/use-activities";
import { ActionBanner, useActionNotice } from "@/components/shared/action-banner";
import type { SortDir } from "@/components/shared/sort-header";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";

interface Activity {
  id: string;
  subject: string;
  kind: string | null;
  due_at?: string | null;
  completed_at?: string | null;
}

const KIND_OPTIONS = [
  { value: "", label: "All types" },
  { value: "call", label: "Call" },
  { value: "meeting", label: "Meeting" },
  { value: "task", label: "Task" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

type SortKey = "subject" | "kind" | "due_at";

interface ActivitiesResponse {
  data: Activity[];
  meta: { total_count: number; total_pages: number; current_page: number };
}

function statusOf(a: Activity): "completed" | "overdue" | "open" {
  if (a.completed_at) return "completed";
  if (a.due_at && new Date(a.due_at) < new Date()) return "overdue";
  return "open";
}

const STATUS_BADGE: Record<string, string> = {
  completed: "badge-success",
  overdue: "badge-danger",
  open: "badge-warning",
};

export default function ActivitiesPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-sm text-[var(--text-secondary)]">Loading...</div>}>
      <ActivitiesPageInner />
    </Suspense>
  );
}

function ActivitiesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Deep-link params win; otherwise restore the last-used filter set.
  const stored = useMemo(() => readRememberedFilters("activities"), []);
  const [q, setQ] = useState(() => (stored.q as string | undefined) ?? "");
  const [debouncedQ, setDebouncedQ] = useState(() => (stored.q as string | undefined) ?? "");
  const [kind, setKind] = useState(() => searchParams.get("kind") ?? (stored.kind as string | undefined) ?? "");
  const [status, setStatus] = useState(() => searchParams.get("status") ?? (stored.status as string | undefined) ?? "");
  const [dealId, setDealId] = useState(() => searchParams.get("deal_id") ?? (stored.dealId as string | undefined) ?? "");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(() => {
    const storedPerPage = stored.perPage as number | undefined;
    return [10, 25, 50].includes(storedPerPage ?? 0) ? (storedPerPage as number) : 25;
  });
  const [sort, setSort] = useState<SortKey>(() => ((stored.sort as SortKey | undefined) ?? "due_at"));
  const [direction, setDirection] = useState<SortDir>(() => ((stored.direction as SortDir | undefined) ?? "asc"));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkAnnouncement, setBulkAnnouncement] = useState("");
  const bulkComplete = useBulkCompleteActivities();
  const reopen = useUpdateActivity();
  const { notice, notify, dismiss, undo, undoing } = useActionNotice();

  const clearSelection = () => setSelectedIds(new Set());
  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleSelectAll = () =>
    setSelectedIds((prev) => {
      const visible = (data?.data ?? []).map((a) => a.id);
      const allSelected = visible.length > 0 && visible.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set([...prev, ...visible]);
    });

  const runBulkComplete = () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setBulkError(null);
    bulkComplete.mutate(ids, {
      onSuccess: (result) => {
        const done = result.completed.length;
        const failed = result.failed.length;
        setBulkAnnouncement(
          failed === 0
            ? `${done} ${done === 1 ? "activity" : "activities"} marked complete.`
            : `${done} completed, ${failed} failed.`
        );
        notify({
          tone: failed === 0 ? "success" : "error",
          message:
            failed === 0
              ? `${done} ${done === 1 ? "activity" : "activities"} marked complete.`
              : `${done} completed, ${failed} failed.`,
          // bulk_complete only ever sets completed_at, so undo has to reopen
          // them individually rather than re-calling it.
          undo:
            failed === 0
              ? async () => {
                  for (const id of result.completed) {
                    await reopen.mutateAsync({ id, completed_at: null });
                  }
                }
              : undefined,
        });
        if (failed === 0) {
          clearSelection();
        } else {
          setSelectedIds(new Set(result.failed.map((f) => f.id)));
          setBulkError(
            `${failed} could not be completed — they stay selected for retry.`
          );
        }
      },
      onError: () => setBulkError("Bulk complete failed — try again."),
    });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // Selection is page-scoped: any filter/page/sort change invalidates it.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [debouncedQ, kind, status, dealId, page, perPage, sort, direction]);

  // Remember the filter set (never the page number).
  useEffect(() => {
    persistFilters("activities", { q, kind, status, dealId, perPage, sort, direction });
  }, [q, kind, status, dealId, perPage, sort, direction]);

  const { data, isLoading } = useQuery({
    queryKey: ["activities", debouncedQ, kind, status, dealId, page, perPage, sort, direction],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/activities", {
        params: {
          query: {
            q: debouncedQ || undefined,
            kind: kind || undefined,
            deal_id: dealId || undefined,
            completed: status === "completed" ? "true" : status === "open" ? "false" : undefined,
            overdue: status === "overdue" ? "true" : undefined,
            page,
            per_page: perPage,
            sort,
            direction,
          } as never,
        },
        headers: getAuthHeadersForApi(),
      });
      if (error) throw error;
      return data as unknown as ActivitiesResponse;
    },
  });

  const { data: dealData } = useDeal(dealId, { enabled: !!dealId });
  const deal = dealData as unknown as { id: string; title: string } | undefined;

  const total = data?.meta?.total_count ?? 0;
  const totalPages = data?.meta?.total_pages ?? 0;
  const currentPage = data?.meta?.current_page ?? page;
  const isFiltered = !!debouncedQ || !!kind || !!status || !!dealId;

  const handleSort = (key: string) => {
    if (key === sort) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key as SortKey);
      setDirection("asc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setQ("");
    setDebouncedQ("");
    setKind("");
    setStatus("");
    setDealId("");
    setPage(1);
    clearSelection();
  };

  const columns: DataTableColumn<Activity>[] = [
    {
      key: "subject",
      label: "Subject",
      sortable: true,
      minWidth: "w-[240px]",
      render: (a) => (
        <span className="font-medium text-[var(--text-primary)]">{a.subject}</span>
      ),
    },
    {
      key: "kind",
      label: "Type",
      sortable: true,
      render: (a) => <span className="text-[var(--text-secondary)] capitalize">{a.kind || "—"}</span>,
    },
    {
      key: "due_at",
      label: "Due Date",
      sortable: true,
      render: (a) => (
        <span className="text-[var(--text-secondary)]">
          {a.due_at ? new Date(a.due_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (a) => {
        const s = statusOf(a);
        return (
          <span className={`badge ${STATUS_BADGE[s]}`}>
            {s === "open" ? "Open" : s === "overdue" ? "Overdue" : "Completed"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activities</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {total} {total === 1 ? "activity" : "activities"}
          </p>
        </div>
        <Link href="/activities/new" className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Log Activity
        </Link>
      </div>

      {dealId && (
        <div className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm">
          <span className="text-[var(--text-secondary)]">
            Filtered to deal:{" "}
            {deal ? (
              <Link
                href={`/deals/${deal.id}`}
                className="font-medium text-[var(--text-primary)] hover:underline"
              >
                {deal.title}
              </Link>
            ) : (
              <span className="text-[var(--text-tertiary)]">Loading deal…</span>
            )}
          </span>
          <button
            onClick={() => {
              setDealId("");
              setPage(1);
            }}
            className="btn-ghost text-sm"
            aria-label="Clear deal filter"
          >
            <X className="h-4 w-4" />
            Deal
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subject or description…"
            className="input pl-9"
            aria-label="Search activities"
          />
        </div>
        <select
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            setPage(1);
          }}
          className="input w-auto text-sm"
          aria-label="Filter by type"
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input w-auto text-sm"
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {isFiltered && (
          <button onClick={clearFilters} className="btn-ghost" aria-label="Clear filters">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <span aria-live="polite" role="status" className="sr-only">
        {bulkAnnouncement}
      </span>
      {notice && (
        <ActionBanner
          notice={notice}
          onUndo={() => void undo()}
          onDismiss={dismiss}
          undoing={undoing}
        />
      )}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm">
          <span className="tabular-nums font-medium">
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            onClick={runBulkComplete}
            disabled={bulkComplete.isPending}
            className="btn-primary !px-3 !py-1.5 text-xs"
          >
            {bulkComplete.isPending ? "Completing…" : "Mark complete"}
          </button>
          <button type="button" onClick={clearSelection} className="btn-ghost !px-3 !py-1.5 text-xs">
            Clear
          </button>
          {bulkError && (
            <span className="text-xs text-[var(--danger-ink)]">{bulkError}</span>
          )}
        </div>
      )}

      <DataTable
        columns={columns}
        rows={data?.data}
        isLoading={isLoading}
        onRowClick={(a) => router.push(`/activities/${a.id}`)}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        sortKey={sort}
        direction={direction}
        onSort={handleSort}
        minWidth="min-w-[720px]"
        empty={
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              {isFiltered ? "No activities match your filters" : "No activities yet"}
            </p>
            {!isFiltered && (
              <Link href="/activities/new" className="btn-primary mt-4">
                <Plus className="h-4 w-4" />
                Log your first activity
              </Link>
            )}
          </div>
        }
        page={currentPage}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
        onPerPage={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        onPage={setPage}
      />
    </div>
  );
}
