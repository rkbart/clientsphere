"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export const PER_PAGE_OPTIONS = [10, 25, 50];

// Shared list footer: rows-per-page selector, range summary and page buttons.
export function PaginationBar({
  page,
  totalPages,
  total,
  countOnPage,
  perPage,
  onPerPage,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  countOnPage: number;
  perPage: number;
  onPerPage: (n: number) => void;
  onPage: (p: number) => void;
}) {
  if (total <= 0) return null;
  const pages = Math.max(totalPages, 1);
  const start = countOnPage === 0 ? 0 : (page - 1) * perPage + 1;
  const end = (page - 1) * perPage + countOnPage;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <label htmlFor="list-rows-per-page">Rows</label>
        <select
          id="list-rows-per-page"
          value={perPage}
          onChange={(e) => onPerPage(Number(e.target.value))}
          className="input w-auto py-1.5"
        >
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span aria-live="polite">
          {start}–{end} of {total}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="btn-ghost p-2 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: Math.min(pages, 7) }).map((_, i) => {
          const pageNum = pages <= 7 ? i + 1
            : page <= 4 ? i + 1
            : page >= pages - 3 ? pages - 6 + i
            : page - 3 + i;
          return (
            <button
              key={pageNum}
              onClick={() => onPage(pageNum)}
              aria-current={pageNum === page ? "page" : undefined}
              className={`min-w-8 h-8 px-2 rounded-[var(--radius-md)] text-sm transition-colors ${
                pageNum === page
                  ? "bg-[var(--accent)] text-[var(--text-inverse)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPage(Math.min(pages, page + 1))}
          disabled={page >= pages}
          className="btn-ghost p-2 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
