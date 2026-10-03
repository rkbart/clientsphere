"use client";

import { type ReactNode } from "react";
import { SortHeader, type SortDir } from "./sort-header";
import { PaginationBar } from "./pagination-bar";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right";
  minWidth?: string;
  render: (row: T) => ReactNode;
}

// Card + table + skeleton + empty state + pagination footer shared by every
// entity list page (contacts, companies, deals).
// Row clicks must never hijack inner controls: ignore events originating
// from interactive descendants (e.g. the Outbox Retry button).
function fromInteractiveDescendant(e: { target: EventTarget | null }): boolean {
  const el = e.target as HTMLElement | null;
  return !!el?.closest?.("button, a, input, select, textarea");
}
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  isLoading,
  onRowClick,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  sortKey,
  direction,
  onSort,
  minWidth = "min-w-[720px]",
  empty,
  page,
  totalPages,
  total,
  perPage,
  onPerPage,
  onPage,
}: {
  columns: DataTableColumn<T>[];
  rows?: T[];
  isLoading: boolean;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  sortKey?: string;
  direction?: SortDir;
  onSort?: (key: string) => void;
  minWidth?: string;
  empty?: ReactNode;
  page?: number;
  totalPages?: number;
  total?: number;
  perPage?: number;
  onPerPage?: (n: number) => void;
  onPage?: (p: number) => void;
}) {
  const showSkeleton = isLoading && columns.length > 0;
  const skeletonWidth = ["w-32", "w-40", "w-24", "w-16", "w-20", "w-28"];
  const isEmpty = !isLoading && (!rows || rows.length === 0);
  const allSelected =
    selectable && !!rows?.length && rows.every((r) => selectedIds?.has(r.id));
  const someSelected =
    selectable && !allSelected && !!rows?.some((r) => selectedIds?.has(r.id));

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`w-full ${minWidth}`}>
          <thead>
            <tr className="border-b border-[var(--border)]">
              {selectable && (
                <th className="table-cell w-10" aria-label="Select all rows">
                  <input
                    type="checkbox"
                    checked={!!allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !!someSelected;
                    }}
                    onChange={() => onToggleSelectAll?.()}
                    aria-label="Select all rows on this page"
                    className="h-4 w-4 accent-[var(--accent)] cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`table-cell table-header ${col.align === "right" ? "text-right" : "text-left"} ${col.minWidth ?? ""}`}
                >
                  {col.sortable && sortKey !== undefined && onSort ? (
                    <SortHeader
                      label={col.label}
                      sortKey={col.key}
                      activeKey={sortKey}
                      direction={direction ?? "asc"}
                      onSort={(k) => onSort(k)}
                    />
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {showSkeleton ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="table-row">
                  {selectable && (
                    <td className="table-cell w-10">
                      <div className="h-4 w-4 bg-[var(--bg-elevated)] rounded animate-pulse" />
                    </td>
                  )}
                  {columns.map((col, j) => (
                    <td key={col.key} className="table-cell">
                      <div className={`h-4 bg-[var(--bg-elevated)] rounded ${skeletonWidth[j % skeletonWidth.length]} animate-pulse`} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              rows?.map((row) => (
                <tr
                  key={row.id}
                  onClick={
                    onRowClick
                      ? (e) => {
                          if (fromInteractiveDescendant(e)) return;
                          onRowClick(row);
                        }
                      : undefined
                  }
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (fromInteractiveDescendant(e)) return;
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  className={`table-row ${onRowClick ? "cursor-pointer" : ""} ${
                    selectedIds?.has(row.id) ? "bg-[var(--accent)]/[0.04]" : ""
                  }`}
                >
                  {selectable && (
                    <td className="table-cell w-10">
                      <input
                        type="checkbox"
                        checked={!!selectedIds?.has(row.id)}
                        onChange={() => onToggleSelect?.(row.id)}
                        aria-label="Select this row"
                        className="h-4 w-4 accent-[var(--accent)] cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`table-cell ${col.align === "right" ? "text-right" : ""}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isEmpty && empty}

      {!isLoading &&
        total !== undefined &&
        totalPages !== undefined &&
        perPage !== undefined &&
        onPerPage !== undefined &&
        onPage !== undefined && (
          <PaginationBar
            page={page ?? 1}
            totalPages={totalPages}
            total={total}
            countOnPage={rows?.length ?? 0}
            perPage={perPage}
            onPerPage={onPerPage}
            onPage={onPage}
          />
        )}
    </div>
  );
}
