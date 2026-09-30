"use client";

import { useParams } from "next/navigation";
import { useDeal } from "@/hooks/use-deals";
import { useStages, usePipelines } from "@/hooks/use-pipelines";
import { NotesSection } from "@/components/shared/notes-section";
import { CustomFieldValues } from "@/components/custom-fields/custom-field-inputs";
import { AiInsights } from "@/components/ai/ai-insights";
import { AiDraftEmail } from "@/components/ai/ai-draft-email";
import Link from "next/link";
import { Pencil } from "lucide-react";

interface DealData {
  id: string;
  title: string;
  amount: number;
  currency: string;
  stage_id: string;
  pipeline_id: string;
  contact_id?: string | null;
  expected_close_date: string;
  probability: number;
  closed_at: string | null;
  custom_data?: Record<string, unknown> | null;
  created_at: string;
}

export default function DealDetailPage() {
  const routeParams = useParams<{ id: string }>();
  const id = Array.isArray(routeParams?.id) ? routeParams.id[0] : (routeParams?.id ?? "");
  const { data, isLoading } = useDeal(id);
  const deal = data as unknown as DealData | undefined;
  const { data: pipelines } = usePipelines();
  const { data: stages } = useStages(deal?.pipeline_id);

  const stageName = stages?.find((s) => s.id === deal?.stage_id)?.name;
  const pipelineName = pipelines?.find((p) => p.id === deal?.pipeline_id)?.name;

  if (isLoading) return <div className="text-center py-8 text-sm text-[var(--text-secondary)]">Loading...</div>;
  if (!deal) return <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">Deal not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{deal.title}</h1>
        <Link href={`/deals/${deal.id}/edit`} className="btn-secondary text-sm shrink-0">
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Deal Info</h2>
          <dl className="space-y-3">
            <div><dt className="text-sm text-[var(--text-secondary)]">Amount</dt><dd className="mt-1 text-2xl font-semibold tracking-tight">${deal.amount?.toLocaleString()}</dd></div>
            <div><dt className="text-sm text-[var(--text-secondary)]">Currency</dt><dd className="mt-1">{deal.currency}</dd></div>
            <div><dt className="text-sm text-[var(--text-secondary)]">Expected Close Date</dt><dd className="mt-1">{deal.expected_close_date || "N/A"}</dd></div>
            <div><dt className="text-sm text-[var(--text-secondary)]">Probability</dt><dd className="mt-1">{deal.probability}%</dd></div>
          </dl>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="space-y-3">
            <div><span className="text-sm text-[var(--text-secondary)]">Stage:</span><span className="ml-2 font-medium">{stageName ?? "—"}</span></div>
            <div><span className="text-sm text-[var(--text-secondary)]">Pipeline:</span><span className="ml-2 font-medium">{pipelineName ?? "—"}</span></div>
            {deal.closed_at && <div><span className="text-sm text-[var(--text-secondary)]">Closed:</span><span className="ml-2 font-medium">{new Date(deal.closed_at).toLocaleDateString()}</span></div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deal.contact_id && <AiDraftEmail contactId={deal.contact_id} dealId={deal.id} />}
        <AiInsights recordType="Deal" recordId={deal.id} />
      </div>

      <CustomFieldValues entityType="Deal" values={deal.custom_data} />

      <NotesSection notableType="Deal" notableId={deal.id} />
    </div>
  );
}
