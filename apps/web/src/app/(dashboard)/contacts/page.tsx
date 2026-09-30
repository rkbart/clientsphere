"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useContacts, useCreateContact } from "@/hooks/use-contacts";
import { useTags, useContactTags } from "@/hooks/use-tags";
import type { Tag } from "@/hooks/use-tags";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { ContactForm, EMPTY_CONTACT } from "@/components/contacts/contact-form";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: "lead" | "customer" | "churned" | null;
  company?: { id: string; name: string } | null;
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

const PER_PAGE_OPTIONS = [10, 25, 50];

type SortKey = "first_name" | "email" | "company";
type SortDir = "asc" | "desc";

interface ContactsResponse {
  data: Contact[];
  meta: { total_count: number; total_pages: number; current_page: number; per_page: number };
}

function ContactTagsCell({ contactId, fallback }: { contactId: string; fallback?: Tag[] }) {
  const { data: live } = useContactTags(contactId);
  const tags = live ?? fallback ?? [];
  if (tags.length === 0) return <span className="text-[var(--text-tertiary)]">—</span>;
  return (
    <span className="flex flex-wrap gap-1 max-w-[16rem]">
      {tags.slice(0, 3).map((tag) => (
        <span
          key={tag.id}
          className="badge badge-neutral"
          style={tag.color ? { backgroundColor: `${tag.color}1a`, color: tag.color } : undefined}
        >
          {tag.name}
        </span>
      ))}
      {tags.length > 3 && <span className="badge badge-neutral">+{tags.length - 3}</span>}
    </span>
  );
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = activeKey === sortKey;
  const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
      aria-label={`Sort by ${label}`}
    >
      {label}
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

export default function ContactsPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [tagId, setTagId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sort, setSort] = useState<SortKey>("first_name");
  const [direction, setDirection] = useState<SortDir>("asc");
  const [addOpen, setAddOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

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
  const pageStart = rowsOnPage === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const pageEnd = (currentPage - 1) * perPage + rowsOnPage;

  const handleSort = (key: SortKey) => {
    if (key === sort) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDirection("asc");
    }
    setPage(1);
  };

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

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="table-cell table-header text-left">
                  <SortHeader label="Name" sortKey="first_name" activeKey={sort} direction={direction} onSort={handleSort} />
                </th>
                <th className="table-cell table-header text-left">
                  <SortHeader label="Email" sortKey="email" activeKey={sort} direction={direction} onSort={handleSort} />
                </th>
                <th className="table-cell table-header text-left">
                  <SortHeader label="Company" sortKey="company" activeKey={sort} direction={direction} onSort={handleSort} />
                </th>
                <th className="table-cell table-header text-left">Status</th>
                <th className="table-cell table-header text-left">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell"><div className="h-4 bg-[var(--bg-elevated)] rounded w-32 animate-pulse" /></td>
                    <td className="table-cell"><div className="h-4 bg-[var(--bg-elevated)] rounded w-40 animate-pulse" /></td>
                    <td className="table-cell"><div className="h-4 bg-[var(--bg-elevated)] rounded w-24 animate-pulse" /></td>
                    <td className="table-cell"><div className="h-5 bg-[var(--bg-elevated)] rounded-full w-16 animate-pulse" /></td>
                    <td className="table-cell"><div className="h-5 bg-[var(--bg-elevated)] rounded-full w-20 animate-pulse" /></td>
                  </tr>
                ))
              ) : (
                typed?.data?.map((contact) => (
                  <tr
                    key={contact.id}
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                    onKeyDown={(e) => { if (e.key === "Enter") router.push(`/contacts/${contact.id}`); }}
                    tabIndex={0}
                    className="table-row cursor-pointer"
                  >
                    <td className="table-cell font-medium text-[var(--text-primary)]">
                      {contact.first_name} {contact.last_name}
                    </td>
                    <td className="table-cell text-[var(--text-secondary)]">{contact.email || "—"}</td>
                    <td className="table-cell text-[var(--text-secondary)]">{contact.company?.name || "—"}</td>
                    <td className="table-cell">
                      <span className={`badge ${contact.status ? STATUS_BADGE[contact.status] : "badge-neutral"}`}>
                        {contact.status ?? "lead"}
                      </span>
                    </td>
                    <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                      <ContactTagsCell contactId={contact.id} fallback={contact.tags} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && (!typed?.data || typed.data.length === 0) && (
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
        )}
        {!isLoading && (typed?.meta?.total_count ?? 0) > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <label htmlFor="contacts-per-page">Rows</label>
              <select
                id="contacts-per-page"
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="input w-auto py-1.5"
              >
                {PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span aria-live="polite">
                {pageStart}–{pageEnd} of {totalCount}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="btn-ghost p-2 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const pageNum = totalPages <= 7 ? i + 1
                  : currentPage <= 4 ? i + 1
                  : currentPage >= totalPages - 3 ? totalPages - 6 + i
                  : currentPage - 3 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    aria-current={pageNum === currentPage ? "page" : undefined}
                    className={`min-w-8 h-8 px-2 rounded-[var(--radius-md)] text-sm transition-colors ${
                      pageNum === currentPage
                        ? "bg-[var(--accent)] text-[var(--text-inverse)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(Math.max(totalPages, 1), p + 1))}
                disabled={currentPage >= Math.max(totalPages, 1)}
                className="btn-ghost p-2 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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
