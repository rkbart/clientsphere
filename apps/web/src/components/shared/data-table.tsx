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
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  isLoading,
  onRowClick,
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
  onRowClick: (row: T) => void;
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

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`w-full ${minWidth}`}>
          <thead>
            <tr className="border-b border-[var(--border)]">
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
                  onClick={() => onRowClick(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onRowClick(row);
                  }}
                  tabIndex={0}
                  className="table-row cursor-pointer"
                >
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
