"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DealForm, EMPTY_DEAL } from "@/components/deals/deal-form";
import { useCreateDeal } from "@/hooks/use-deals";
import { usePipelines } from "@/hooks/use-pipelines";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft } from "lucide-react";

export default function NewDealPage() {
  const router = useRouter();
  const create = useCreateDeal();
  const { data: pipelines } = usePipelines();
  const [error, setError] = useState<string | null>(null);

  const list = (pipelines as unknown as { id: string; is_default?: boolean }[] | undefined) ?? [];
  const defaultId = list.find((p) => p.is_default)?.id ?? list[0]?.id ?? "";

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href="/deals"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to deals
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">New Deal</h1>
      </div>

      <div className="card p-6 space-y-4">
        <FormError message={error} />
        <DealForm
          key={defaultId}
          initial={{ ...EMPTY_DEAL, pipeline_id: defaultId }}
          submitting={create.isPending}
          submitLabel="Create deal"
          onSubmit={async (values) => {
            setError(null);
            try {
              const result = (await create.mutateAsync(values)) as unknown as { id: string };
              router.push(`/deals/${result.id}`);
            } catch (e) {
              setError(errMessage(e, "Could not create the deal."));
            }
          }}
        />
      </div>
    </div>
  );
}
