"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useContacts, useCreateContact } from "@/hooks/use-contacts";
import { persistFilters, readRememberedFilters } from "@/hooks/use-remembered-filters";
import { useTags } from "@/hooks/use-tags";
import { TagsCell } from "@/components/shared/tags-cell";
import type { Tag } from "@/hooks/use-tags";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { ContactForm, EMPTY_CONTACT } from "@/components/contacts/contact-form";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { Plus, Search, X } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import type { SortDir } from "@/components/shared/sort-header";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: "lead" | "customer" | "churned" | null;
  company?: { id: string; name: string } | null;
  city?: string | null;
  tags?: Tag[];
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "lead", label: "Lead" },
  { value: "customer", label: "Customer" },
  { value: "churned", label: "Churned" },
];

const STATUS_BADGE: Record<string, string> = {
  lead: "badge-warning",
  customer: "badge-success",
  churned: "badge-neutral",
};

type SortKey = "first_name" | "email" | "company";

interface ContactsResponse {
  data: Contact[];
  meta: { total_count: number; total_pages: number; current_page: number; per_page: number };
}

export default function ContactsPage() {
  const stored = useMemo(() => readRememberedFilters("contacts"), []);
  const [q, setQ] = useState(() => (stored.q as string | undefined) ?? "");
  const [debouncedQ, setDebouncedQ] = useState(() => (stored.q as string | undefined) ?? "");
  const [tagId, setTagId] = useState(() => (stored.tagId as string | undefined) ?? "");
  const [status, setStatus] = useState(() => (stored.status as string | undefined) ?? "");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(() => {
    const n = stored.perPage as number | undefined;
    return [10, 25, 50].includes(n ?? 0) ? (n as number) : 25;
  });
  const [sort, setSort] = useState<SortKey>(() => ((stored.sort as SortKey | undefined) ?? "first_name"));
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
    persistFilters("contacts", { q, tagId, status, perPage, sort, direction });
  }, [q, tagId, status, perPage, sort, direction]);

  const { data, isLoading } = useContacts({
    q: debouncedQ || undefined,
    tag_id: tagId || undefined,
    status: status || undefined,
    page,
    per_page: perPage,
    sort,
    direction,
  });
  const { data: tags } = useTags();
  const create = useCreateContact();
  const typed = data as unknown as ContactsResponse;
  const isFiltered = !!debouncedQ || !!tagId || !!status;
  const totalPages = typed?.meta?.total_pages ?? 0;
  const currentPage = typed?.meta?.current_page ?? page;
  const totalCount = typed?.meta?.total_count ?? 0;
  const rowsOnPage = typed?.data?.length ?? 0;

  const handleSort = (key: string) => {
    if (key === sort) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key as SortKey);
      setDirection("asc");
    }
    setPage(1);
  };

  const columns: DataTableColumn<Contact>[] = [
    {
      key: "first_name",
      label: "Name",
      sortable: true,
      minWidth: "w-[240px]",
      render: (c) => (
        <Link
          href={`/contacts/${c.id}`}
          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
        >
          {c.first_name} {c.last_name}
        </Link>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (c) => <span className="text-[var(--text-secondary)]">{c.email || "—"}</span>,
    },
    {
      key: "company",
      label: "Company",
      sortable: true,
      render: (c) => <span className="text-[var(--text-secondary)]">{c.company?.name || "—"}</span>,
    },
    {
      key: "city",
      label: "City",
      render: (c) => <span className="text-[var(--text-secondary)]">{c.city || "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (c) => (
        <span className={`badge ${c.status ? STATUS_BADGE[c.status] : "badge-neutral"}`}>
          {c.status ?? "lead"}
        </span>
      ),
    },
    { key: "tags", label: "Tags", render: (c) => <TagsCell tags={c.tags} /> },
  ];

  const clearFilters = () => {
    setQ("");
    setDebouncedQ("");
    setTagId("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {totalCount} {totalCount === 1 ? "contact" : "contacts"}
          </p>
        </div>
        <button
          onClick={() => { setCreateError(null); setAddOpen(true); }}
          className="btn-primary self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email…"
            className="input pl-9"
            aria-label="Search contacts"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="input w-auto"
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={tagId}
            onChange={(e) => { setTagId(e.target.value); setPage(1); }}
            className="input w-auto min-w-[10rem]"
            aria-label="Filter by tag"
          >
            <option value="">All tags</option>
            {tags?.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="btn-ghost"
              aria-label="Clear filters"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={typed?.data}
        isLoading={isLoading}
        sortKey={sort}
        direction={direction}
        onSort={handleSort}
        minWidth="min-w-[760px]"
        empty={
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              {isFiltered ? "No contacts match your filters" : "No contacts found"}
            </p>
            {!isFiltered && (
              <button onClick={() => { setCreateError(null); setAddOpen(true); }} className="btn-primary mt-4">
                <Plus className="h-4 w-4" />
                Add your first contact
              </button>
            )}
          </div>
        }
        page={currentPage}
        totalPages={totalPages}
        total={totalCount}
        perPage={perPage}
        onPerPage={(n) => { setPerPage(n); setPage(1); }}
        onPage={setPage}
      />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add contact"
        description="Create a new contact in your workspace."
      >
        <FormError message={createError} />
        <ContactForm
          initial={EMPTY_CONTACT}
          submitting={create.isPending}
          submitLabel="Create contact"
          onSubmit={async (values) => {
            setCreateError(null);
            try {
              await create.mutateAsync(values);
              setAddOpen(false);
            } catch (e) {
              setCreateError(errMessage(e, "Could not create the contact."));
            }
          }}
        />
      </Modal>
    </div>
  );
}
