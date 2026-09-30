"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export type SortDir = "asc" | "desc";

// Asc/desc toggle used in list table headers. Clicking cycles:
// inactive -> asc, asc -> desc, desc -> asc.
export function SortHeader<T extends string>({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: T;
  activeKey: T;
  direction: SortDir;
  onSort: (key: T) => void;
}) {
  const active = activeKey === sortKey;
  const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
      aria-label={`Sort by ${label}`}
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : undefined}
    >
      {label}
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
