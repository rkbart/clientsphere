"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";
import { useDeal } from "@/hooks/use-deals";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
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
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [kind, setKind] = useState(() => searchParams.get("kind") ?? "");
  const [status, setStatus] = useState(() => searchParams.get("status") ?? "");
  const [dealId, setDealId] = useState(() => searchParams.get("deal_id") ?? "");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sort, setSort] = useState<SortKey>("due_at");
  const [direction, setDirection] = useState<SortDir>("asc");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

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
  };

  const columns: DataTableColumn<Activity>[] = [
    {
      key: "subject",
      label: "Subject",
      sortable: true,
      minWidth: "w-[240px]",
      render: (a) => (
        <Link
          href={`/activities/${a.id}`}
          className="font-medium text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          {a.subject}
        </Link>
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

      <DataTable
        columns={columns}
        rows={data?.data}
        isLoading={isLoading}
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
