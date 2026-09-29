"use client";

import { useCompanies } from "@/hooks/use-companies";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
}

interface CompaniesResponse {
  data: Company[];
  meta: { total_count: number };
}

export default function CompaniesPage() {
  const { data, isLoading } = useCompanies();
  const typed = data as unknown as CompaniesResponse;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {typed?.meta?.total_count ?? 0} companies
          </p>
        </div>
        <Link href="/companies/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Company
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="table-cell table-header text-left">Name</th>
              <th className="table-cell table-header text-left">Domain</th>
              <th className="table-cell table-header text-left">Industry</th>
              <th className="table-cell table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="table-row">
                  <td className="table-cell"><div className="h-4 bg-[var(--bg-elevated)] rounded w-32 animate-pulse" /></td>
                  <td className="table-cell"><div className="h-4 bg-[var(--bg-elevated)] rounded w-36 animate-pulse" /></td>
                  <td className="table-cell"><div className="h-4 bg-[var(--bg-elevated)] rounded w-24 animate-pulse" /></td>
                  <td className="table-cell text-right"><div className="h-4 bg-[var(--bg-elevated)] rounded w-12 animate-pulse ml-auto" /></td>
                </tr>
              ))
            ) : (
              typed?.data?.map((company) => (
                <tr key={company.id} className="table-row">
                  <td className="table-cell">
                    <Link
                      href={`/companies/${company.id}`}
                      className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-hover)] transition-colors"
                    >
                      {company.name}
                    </Link>
                  </td>
                  <td className="table-cell text-[var(--text-secondary)]">{company.domain}</td>
                  <td className="table-cell text-[var(--text-secondary)]">{company.industry}</td>
                  <td className="table-cell text-right">
                    <Link
                      href={`/companies/${company.id}`}
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

        {!isLoading && (!typed?.data || typed.data.length === 0) && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">No companies found</p>
          </div>
        )}
      </div>
    </div>
  );
}
