"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CompanyForm, type CompanyFormValues } from "@/components/companies/company-form";
import { useCompany, useUpdateCompany } from "@/hooks/use-companies";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft } from "lucide-react";

interface CompanyRecord {
  name?: string | null;
  domain?: string | null;
  industry?: string | null;
  size_range?: string | null;
  annual_revenue?: number | string | null;
  description?: string | null;
}

export default function EditCompanyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, isLoading } = useCompany(params.id);
  const update = useUpdateCompany();
  const [error, setError] = useState<string | null>(null);
  const company = data as unknown as CompanyRecord | undefined;

  const initial: CompanyFormValues = {
    name: company?.name ?? "",
    domain: company?.domain ?? "",
    industry: company?.industry ?? "",
    size_range: company?.size_range ?? "",
    annual_revenue: company?.annual_revenue == null ? "" : String(company.annual_revenue),
    description: company?.description ?? "",
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href={`/companies/${params.id}`}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to company
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Edit Company</h1>
      </div>

      <div className="card p-6 space-y-4">
        {isLoading ? (
          <div className="h-64 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] animate-pulse" />
        ) : !company ? (
          <p className="text-sm text-[var(--text-tertiary)]">Company not found</p>
        ) : (
          <>
            <FormError message={error} />
            <CompanyForm
              key={params.id}
              initial={initial}
              submitting={update.isPending}
              submitLabel="Save changes"
              onSubmit={async (values) => {
                setError(null);
                try {
                  await update.mutateAsync({ id: params.id, ...values });
                  router.push(`/companies/${params.id}`);
                } catch (e) {
                  setError(errMessage(e, "Could not save the company."));
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
