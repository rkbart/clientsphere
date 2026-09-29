"use client";

import { useDeals } from "@/hooks/use-deals";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Deal {
  id: string;
  title: string;
  amount: number;
  stage_id: string;
  expected_close_date: string;
}

interface DealsResponse {
  data: Deal[];
  meta: { total_count: number };
}

export default function DealsPage() {
  const { data, isLoading } = useDeals();
  const typed = data as unknown as DealsResponse;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deals</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {typed?.meta?.total_count ?? 0} deals
          </p>
        </div>
        <Link href="/deals/new" className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Deal
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="table-cell table-header text-left">Title</th>
              <th className="table-cell table-header text-left">Amount</th>
              <th className="table-cell table-header text-left">Close date</th>
              <th className="table-cell table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="table-row">
                  <td className="table-cell"><div className="h-4 bg-[var(--bg-elevated)] rounded w-40 animate-pulse" /></td>
                  <td className="table-cell"><div className="h-4 bg-[var(--bg-elevated)] rounded w-20 animate-pulse" /></td>
                  <td className="table-cell"><div className="h-4 bg-[var(--bg-elevated)] rounded w-24 animate-pulse" /></td>
                  <td className="table-cell text-right"><div className="h-4 bg-[var(--bg-elevated)] rounded w-12 animate-pulse ml-auto" /></td>
                </tr>
              ))
            ) : (
              typed?.data?.map((deal) => (
                <tr key={deal.id} className="table-row">
                  <td className="table-cell">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-hover)] transition-colors"
                    >
                      {deal.title}
                    </Link>
                  </td>
                  <td className="table-cell text-[var(--text-secondary)] tabular-nums">
                    ${deal.amount?.toLocaleString()}
                  </td>
                  <td className="table-cell text-[var(--text-secondary)]">
                    {deal.expected_close_date
                      ? new Date(deal.expected_close_date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="table-cell text-right">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {!isLoading && (!typed?.data || typed.data.length === 0) && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">No deals found</p>
          </div>
        )}
      </div>
    </div>
  );
}
