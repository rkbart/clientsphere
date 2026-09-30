"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  source?: string | null;
  custom_data?: Record<string, unknown> | null;
}

export default function EditDealPage() {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const id = Array.isArray(routeParams?.id) ? routeParams.id[0] : (routeParams?.id ?? "");
  const { data, isLoading } = useDeal(id);
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
    source: deal?.source ?? "",
    custom_data: deal?.custom_data ?? {},
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href={`/deals/${id}`}
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
              key={id}
              initial={initial}
              submitting={update.isPending}
              submitLabel="Save changes"
              onSubmit={async (values) => {
                setError(null);
                try {
                  await update.mutateAsync({ id, ...values });
                  router.push(`/deals/${id}`);
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
