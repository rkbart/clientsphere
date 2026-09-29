"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CompanyForm, EMPTY_COMPANY } from "@/components/companies/company-form";
import { useCreateCompany } from "@/hooks/use-companies";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft } from "lucide-react";

export default function NewCompanyPage() {
  const router = useRouter();
  const create = useCreateCompany();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href="/companies"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to companies
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">New Company</h1>
      </div>

      <div className="card p-6 space-y-4">
        <FormError message={error} />
        <CompanyForm
          initial={EMPTY_COMPANY}
          submitting={create.isPending}
          submitLabel="Create company"
          onSubmit={async (values) => {
            setError(null);
            try {
              const result = (await create.mutateAsync(values)) as unknown as { id: string };
              router.push(`/companies/${result.id}`);
            } catch (e) {
              setError(errMessage(e, "Could not create the company."));
            }
          }}
        />
      </div>
    </div>
  );
}
