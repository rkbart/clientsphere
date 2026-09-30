"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DealForm, type DealFormValues } from "@/components/deals/deal-form";
import { useDeal, useUpdateDeal } from "@/hooks/use-deals";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft } from "lucide-react";

interface DealRecord {
  title?: string | null;
  amount?: number | string | null;
  pipeline_id?: string | null;
  stage_id?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  expected_close_date?: string | null;
  probability?: number | string | null;
  custom_data?: Record<string, unknown> | null;
}

export default function EditDealPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, isLoading } = useDeal(params.id);
  const update = useUpdateDeal();
  const [error, setError] = useState<string | null>(null);
  const deal = data as unknown as DealRecord | undefined;

  const initial: DealFormValues = {
    title: deal?.title ?? "",
    amount: deal?.amount == null ? "" : String(deal.amount),
    pipeline_id: deal?.pipeline_id ?? "",
    stage_id: deal?.stage_id ?? "",
    contact_id: deal?.contact_id ?? "",
    company_id: deal?.company_id ?? "",
    expected_close_date: (deal?.expected_close_date ?? "").slice(0, 10),
    probability: deal?.probability == null ? "" : String(deal.probability),
    custom_data: deal?.custom_data ?? {},
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href={`/deals/${params.id}`}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to deal
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Edit Deal</h1>
      </div>

      <div className="card p-6 space-y-4">
        {isLoading ? (
          <div className="h-64 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] animate-pulse" />
        ) : !deal ? (
          <p className="text-sm text-[var(--text-tertiary)]">Deal not found</p>
        ) : (
          <>
            <FormError message={error} />
            <DealForm
              key={params.id}
              initial={initial}
              submitting={update.isPending}
              submitLabel="Save changes"
              onSubmit={async (values) => {
                setError(null);
                try {
                  await update.mutateAsync({ id: params.id, ...values });
                  router.push(`/deals/${params.id}`);
                } catch (e) {
                  setError(errMessage(e, "Could not save the deal."));
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
