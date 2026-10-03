"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDeals, useCreateDeal } from "@/hooks/use-deals";
import { persistFilters, readRememberedFilters } from "@/hooks/use-remembered-filters";
import { usePipelines, useStages } from "@/hooks/use-pipelines";
import { useTags } from "@/hooks/use-tags";
import type { Tag } from "@/hooks/use-tags";
import { TagsCell } from "@/components/shared/tags-cell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import type { SortDir } from "@/components/shared/sort-header";
import { Modal } from "@/components/ui/modal";
import { DealForm, EMPTY_DEAL } from "@/components/deals/deal-form";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/error";
import { Plus, Search, X } from "lucide-react";

interface Deal {
  id: string;
  title: string;
  amount: number | string | null;
  currency: string | null;
  expected_close_date: string | null;
  stage?: { id: string; name: string; color: string | null } | null;
  company?: { id: string; name: string } | null;
  tags?: Tag[];
}

// "" = default pipeline order (backend falls back to position)
type SortKey = "" | "title" | "amount" | "expected_close_date";

interface DealsResponse {
  data: Deal[];
  meta: { total_count: number; total_pages: number; current_page: number };
}

function money(value: number | string | null | undefined, currency = "USD") {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency });
}

export default function DealsPage() {
  const router = useRouter();
  const stored = useMemo(() => readRememberedFilters("deals"), []);
  const [q, setQ] = useState(() => (stored.q as string | undefined) ?? "");
  const [debouncedQ, setDebouncedQ] = useState(() => (stored.q as string | undefined) ?? "");
  const [stageId, setStageId] = useState(() => (stored.stageId as string | undefined) ?? "");
  const [tagId, setTagId] = useState(() => (stored.tagId as string | undefined) ?? "");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(() => {
    const n = stored.perPage as number | undefined;
    return [10, 25, 50].includes(n ?? 0) ? (n as number) : 25;
  });
  const [sort, setSort] = useState<SortKey>(() => ((stored.sort as SortKey | undefined) ?? ""));
  const [direction, setDirection] = useState<SortDir>(() => ((stored.direction as SortDir | undefined) ?? "asc"));
  const [addOpen, setAddOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    persistFilters("deals", { q, stageId, tagId, perPage, sort, direction });
  }, [q, stageId, tagId, perPage, sort, direction]);

  const { data, isLoading } = useDeals({
    q: debouncedQ || undefined,
    stage_id: stageId || undefined,
    tag_id: tagId || undefined,
    page,
    per_page: perPage,
    ...(sort ? { sort, direction } : {}),
  });
  const { data: pipelines } = usePipelines();
  const pipeline = pipelines?.find((p) => p.is_default) ?? pipelines?.[0];
  const { data: stages } = useStages(pipeline?.id);
  const { data: tags } = useTags();
  const create = useCreateDeal();
  const typed = data as unknown as DealsResponse;
  const isFiltered = !!debouncedQ || !!stageId || !!tagId;
  const total = typed?.meta?.total_count ?? 0;
  const totalPages = typed?.meta?.total_pages ?? 0;
  const currentPage = typed?.meta?.current_page ?? page;

  const handleSort = (key: string) => {
    if (key === sort) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key as SortKey);
      setDirection("asc");
    }
    setPage(1);
  };

  const columns: DataTableColumn<Deal>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      minWidth: "w-[260px]",
      render: (d) => (
        <span className="font-medium text-[var(--text-primary)]">
          {d.title}
          {d.company?.name && (
            <span className="text-[var(--text-tertiary)] font-normal"> · {d.company.name}</span>
          )}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (d) => <span className="tabular-nums">{money(d.amount, d.currency ?? "USD")}</span>,
    },
    {
      key: "stage",
      label: "Stage",
      render: (d) =>
        d.stage ? (
          <span
            className="badge badge-neutral"
            style={d.stage.color ? { backgroundColor: `${d.stage.color}1a`, color: d.stage.color } : undefined}
          >
            {d.stage.name}
          </span>
        ) : (
          <span className="text-[var(--text-tertiary)]">—</span>
        ),
    },
    {
      key: "expected_close_date",
      label: "Close date",
      sortable: true,
      render: (d) => (
        <span className="text-[var(--text-secondary)]">
          {d.expected_close_date
            ? new Date(d.expected_close_date).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    { key: "tags", label: "Tags", render: (d) => <TagsCell tags={d.tags} /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deals</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {total} {total === 1 ? "deal" : "deals"}
          </p>
        </div>
        <button
          onClick={() => { setCreateError(null); setAddOpen(true); }}
          className="btn-primary self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Deal
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search deal title…"
            className="input pl-9"
            aria-label="Search deals"
          />
        </div>
        <select
          value={stageId}
          onChange={(e) => {
            setStageId(e.target.value);
            setPage(1);
          }}
          className="input w-auto text-sm"
          aria-label="Filter by stage"
        >
          <option value="">All stages</option>
          {(stages ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={tagId}
          onChange={(e) => {
            setTagId(e.target.value);
            setPage(1);
          }}
          className="input w-auto text-sm"
          aria-label="Filter by tag"
        >
          <option value="">All tags</option>
          {(tags ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {isFiltered && (
          <button
            onClick={() => {
              setQ("");
              setStageId("");
              setTagId("");
            }}
            className="btn-ghost"
            aria-label="Clear filters"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={typed?.data}
        isLoading={isLoading}
        onRowClick={(d) => router.push(`/deals/${d.id}`)}
        sortKey={sort}
        direction={direction}
        onSort={handleSort}
        minWidth="min-w-[880px]"
        empty={
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              {isFiltered ? "No deals match your search" : "No deals yet"}
            </p>
            {!isFiltered && (
              <button onClick={() => { setCreateError(null); setAddOpen(true); }} className="btn-primary mt-4">
                <Plus className="h-4 w-4" />
                Create your first deal
              </button>
            )}
          </div>
        }
        page={currentPage}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
        onPerPage={(n) => { setPerPage(n); setPage(1); }}
        onPage={setPage}
      />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add deal"
        description="Track a new opportunity in your pipeline."
        maxWidth="max-w-2xl"
      >
        <FormError message={createError} />
        <DealForm
          initial={EMPTY_DEAL}
          submitting={create.isPending}
          submitLabel="Create deal"
          onSubmit={async (values) => {
            setCreateError(null);
            try {
              await create.mutateAsync(values);
              setAddOpen(false);
            } catch (e) {
              setCreateError(errMessage(e, "Could not create the deal."));
            }
          }}
        />
      </Modal>
    </div>
  );
}

