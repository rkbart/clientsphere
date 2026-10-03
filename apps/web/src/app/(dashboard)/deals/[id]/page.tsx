"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDeal, useUpdateDeal, useDeleteDeal } from "@/hooks/use-deals";
import { useContact } from "@/hooks/use-contacts";
import { useCompany } from "@/hooks/use-companies";
import { useStages, usePipelines } from "@/hooks/use-pipelines";
import { NotesSection } from "@/components/shared/notes-section";
import { TagEditor } from "@/components/shared/tag-editor";
import { CustomFieldValues } from "@/components/custom-fields/custom-field-inputs";
import { DealSummary } from "@/components/deals/deal-summary";
import { DealOverdueTasks } from "@/components/deals/deal-overdue-tasks";
import { EmailComposer } from "@/components/emails/email-composer";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { DealForm, type DealFormValues } from "@/components/deals/deal-form";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/error";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";

interface DealData {
  id: string;
  title: string;
  amount: number | string | null;
  currency: string;
  stage_id: string;
  pipeline_id: string;
  contact_id?: string | null;
  company_id?: string | null;
  expected_close_date: string | null;
  probability: number | null;
  source?: string | null;
  custom_data?: Record<string, unknown> | null;
}

function money(value: number | string | null | undefined, currency = "USD") {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency });
}

export default function DealDetailPage() {
  const routeParams = useParams<{ id: string }>();
  const id = Array.isArray(routeParams?.id) ? routeParams.id[0] : (routeParams?.id ?? "");
  const router = useRouter();
  const { data, isLoading } = useDeal(id);
  const update = useUpdateDeal();
  const remove = useDeleteDeal();
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deal = data as unknown as DealData | undefined;
  const { data: pipelines } = usePipelines();
  const { data: stages } = useStages(deal?.pipeline_id);
  const { data: contactData } = useContact(deal?.contact_id ?? "", {
    enabled: !!deal?.contact_id,
  });
  const { data: companyData } = useCompany(deal?.company_id ?? "", {
    enabled: !!deal?.company_id,
  });
  const contact = contactData as unknown as { id: string; first_name: string; last_name?: string | null } | undefined;
  const company = companyData as unknown as { id: string; name: string } | undefined;

  const stageName = stages?.find((s) => s.id === deal?.stage_id)?.name;
  const pipelineName = pipelines?.find((p) => p.id === deal?.pipeline_id)?.name;

  if (isLoading) {
    return <div className="text-center py-8 text-sm text-[var(--text-secondary)]">Loading...</div>;
  }
  if (!deal) {
    return <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">Deal not found</div>;
  }

  const initial: DealFormValues = {
    title: deal.title ?? "",
    amount: deal.amount == null ? "" : String(deal.amount),
    pipeline_id: deal.pipeline_id ?? "",
    stage_id: deal.stage_id ?? "",
    contact_id: deal.contact_id ?? "",
    company_id: deal.company_id ?? "",
    expected_close_date: deal.expected_close_date ?? "",
    probability: deal.probability == null ? "" : String(deal.probability),
    source: deal.source ?? "",
    custom_data: (deal.custom_data ?? {}) as DealFormValues["custom_data"],
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <Link
          href="/deals"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to deals
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <h1 className="text-2xl font-semibold tracking-tight">{deal.title}</h1>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setEditError(null); setEditOpen(true); }}
              className="btn-secondary text-sm"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => { setDeleteError(null); setConfirmDelete(true); }}
              className="btn-secondary text-sm !text-[var(--danger)]"
              aria-label="Delete deal"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Deal details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Amount</dt>
              <dd className="mt-0.5 text-sm tabular-nums font-semibold">
                {money(deal.amount, deal.currency ?? "USD")}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Close date</dt>
              <dd className="mt-0.5 text-sm">
                {deal.expected_close_date
                  ? new Date(deal.expected_close_date).toLocaleDateString()
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Probability</dt>
              <dd className="mt-0.5 text-sm">{deal.probability ?? 0}%</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Source</dt>
              <dd className="mt-0.5 text-sm">{deal.source || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Company</dt>
              <dd className="mt-0.5 text-sm">
                {deal.company_id ? (
                  <Link
                    href={`/companies/${deal.company_id}`}
                    className="hover:text-[var(--accent-hover)] transition-colors"
                  >
                    {company ? company.name : "—"}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Contact</dt>
              <dd className="mt-0.5 text-sm">
                {deal.contact_id ? (
                  <Link
                    href={`/contacts/${deal.contact_id}`}
                    className="hover:text-[var(--accent-hover)] transition-colors"
                  >
                    {contact ? `${contact.first_name} ${contact.last_name ?? ""}`.trim() : "—"}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Status</h2>
          <dl className="grid grid-cols-1 gap-y-4">
            <div>
              <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Stage</dt>
              <dd className="mt-0.5 text-sm">{stageName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Pipeline</dt>
              <dd className="mt-0.5 text-sm">{pipelineName ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="space-y-6">
        <DealOverdueTasks key={deal.id} dealId={deal.id} />
        <DealSummary dealId={deal.id} />
        {deal.contact_id && <EmailComposer contactId={deal.contact_id} dealId={deal.id} />}
      </div>

      <TagEditor entity="Deal" entityId={deal.id} />

      <CustomFieldValues entityType="Deal" values={deal.custom_data} />

      <NotesSection notableType="Deal" notableId={deal.id} />

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit deal"
        description="Update this opportunity."
        maxWidth="max-w-2xl"
      >
        <FormError message={editError} />
        <DealForm
          initial={initial}
          submitting={update.isPending}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            setEditError(null);
            try {
              await update.mutateAsync({ id: deal.id, ...values });
              setEditOpen(false);
            } catch (e) {
              setEditError(errMessage(e, "Could not save the deal."));
            }
          }}
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setDeleteError(null);
          remove.mutate(deal.id, {
            onSuccess: () => router.push("/deals"),
            onError: (e) => setDeleteError(errMessage(e, "Could not delete the deal.")),
          });
        }}
        title="Delete deal?"
        message={`${deal.title} will be permanently removed. This action cannot be undone.`}
        confirming={remove.isPending}
        error={deleteError}
      />
    </div>
  );
}
