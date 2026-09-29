"use client";

import { useCompany } from "@/hooks/use-companies";
import { NotesSection } from "@/components/shared/notes-section";
import { AiEnrich } from "@/components/ai/ai-enrich";
import Link from "next/link";
import { Pencil } from "lucide-react";

interface CompanyData {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size_range: string;
  annual_revenue: number;
  description: string;
}

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useCompany(params.id);
  const company = data as unknown as CompanyData | undefined;

  if (isLoading) return <div className="text-center py-8 text-sm text-[var(--text-secondary)]">Loading...</div>;
  if (!company) return <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">Company not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
        <Link href={`/companies/${company.id}/edit`} className="btn-secondary text-sm shrink-0">
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Company Info</h2>
          <dl className="space-y-3">
            <div><dt className="text-sm text-[var(--text-secondary)]">Domain</dt><dd className="mt-1">{company.domain}</dd></div>
            <div><dt className="text-sm text-[var(--text-secondary)]">Industry</dt><dd className="mt-1">{company.industry}</dd></div>
            <div><dt className="text-sm text-[var(--text-secondary)]">Size Range</dt><dd className="mt-1">{company.size_range || "N/A"}</dd></div>
            <div><dt className="text-sm text-[var(--text-secondary)]">Annual Revenue</dt><dd className="mt-1">{company.annual_revenue ? `$${company.annual_revenue.toLocaleString()}` : "N/A"}</dd></div>
          </dl>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <p className="text-[var(--text-primary)]">{company.description || "No description provided."}</p>
        </div>
      </div>

      <AiEnrich company={company} />

      <NotesSection notableType="Company" notableId={company.id} />
    </div>
  );
}
