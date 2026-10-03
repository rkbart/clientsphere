"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCompanies, useCreateCompany } from "@/hooks/use-companies";
import { persistFilters, readRememberedFilters } from "@/hooks/use-remembered-filters";
import type { Tag } from "@/hooks/use-tags";
import { TagsCell } from "@/components/shared/tags-cell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import type { SortDir } from "@/components/shared/sort-header";
import { Modal } from "@/components/ui/modal";
import { CompanyForm, EMPTY_COMPANY } from "@/components/companies/company-form";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { Plus, Search } from "lucide-react";

interface Company {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  tags?: Tag[];
}

type SortKey = "name" | "domain" | "industry";

interface CompaniesResponse {
  data: Company[];
  meta: { total_count: number; total_pages: number; current_page: number };
}

export default function CompaniesPage() {
  const stored = useMemo(() => readRememberedFilters("companies"), []);
  const [q, setQ] = useState(() => (stored.q as string | undefined) ?? "");
  const [debouncedQ, setDebouncedQ] = useState(() => (stored.q as string | undefined) ?? "");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(() => {
    const n = stored.perPage as number | undefined;
    return [10, 25, 50].includes(n ?? 0) ? (n as number) : 25;
  });
  const [sort, setSort] = useState<SortKey>(() => ((stored.sort as SortKey | undefined) ?? "name"));
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
    persistFilters("companies", { q, perPage, sort, direction });
  }, [q, perPage, sort, direction]);

  const { data, isLoading } = useCompanies({
    q: debouncedQ || undefined,
    page,
    per_page: perPage,
    sort,
    direction,
  });
  const create = useCreateCompany();
  const typed = data as unknown as CompaniesResponse;
  const isFiltered = !!debouncedQ;
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

  const columns: DataTableColumn<Company>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      minWidth: "w-[260px]",
      render: (c) => (
        <Link
          href={`/companies/${c.id}`}
          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
        >
          {c.name}
        </Link>
      ),
    },
    { key: "domain", label: "Domain", sortable: true, render: (c) => <span className="text-[var(--text-secondary)]">{c.domain || "—"}</span> },
    { key: "industry", label: "Industry", sortable: true, render: (c) => <span className="text-[var(--text-secondary)]">{c.industry || "—"}</span> },
    { key: "tags", label: "Tags", render: (c) => <TagsCell tags={c.tags} /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {total} {total === 1 ? "company" : "companies"}
          </p>
        </div>
        <button
          onClick={() => { setCreateError(null); setAddOpen(true); }}
          className="btn-primary self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, domain or industry…"
            className="input pl-9"
            aria-label="Search companies"
          />
        </div>
        {isFiltered && (
          <button onClick={() => setQ("")} className="btn-ghost" aria-label="Clear search">
            Clear
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={typed?.data}
        isLoading={isLoading}
        sortKey={sort}
        direction={direction}
        onSort={handleSort}
        minWidth="min-w-[720px]"
        empty={
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              {isFiltered ? "No companies match your search" : "No companies yet"}
            </p>
            {!isFiltered && (
              <button onClick={() => { setCreateError(null); setAddOpen(true); }} className="btn-primary mt-4">
                <Plus className="h-4 w-4" />
                Add your first company
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
        title="Add company"
        description="Create a new company in your workspace."
      >
        <FormError message={createError} />
        <CompanyForm
          initial={EMPTY_COMPANY}
          submitting={create.isPending}
          submitLabel="Create company"
          onSubmit={async (values) => {
            setCreateError(null);
            try {
              await create.mutateAsync(values);
              setAddOpen(false);
            } catch (e) {
              setCreateError(errMessage(e, "Could not create the company."));
            }
          }}
        />
      </Modal>
    </div>
  );
}
