"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCompany, useUpdateCompany, useDeleteCompany } from "@/hooks/use-companies";
import { NotesSection } from "@/components/shared/notes-section";
import { TagEditor } from "@/components/shared/tag-editor";
import { CustomFieldValues } from "@/components/custom-fields/custom-field-inputs";
import { AiEnrich } from "@/components/ai/ai-enrich";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { CompanyForm, type CompanyFormValues } from "@/components/companies/company-form";
import { SocialIcon, type SocialLink } from "@/components/shared/social-links-editor";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";

interface CompanyData {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size_range: string | null;
  annual_revenue: number | null;
  description: string | null;
  address?: string | null;
  employee_count?: number | null;
  social_links?: SocialLink[] | null;
  added_by?: { id: string; name: string } | null;
  main_contact?: { id: string; first_name: string; last_name?: string | null } | null;
  main_contact_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  created_at: string;
}

export default function CompanyDetailPage() {
  const routeParams = useParams<{ id: string }>();
  const id = Array.isArray(routeParams?.id) ? routeParams.id[0] : (routeParams?.id ?? "");
  const router = useRouter();
  const { data, isLoading } = useCompany(id);
  const update = useUpdateCompany();
  const remove = useDeleteCompany();
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const company = data as unknown as CompanyData | undefined;

  if (isLoading) {
    return <div className="text-center py-8 text-sm text-[var(--text-secondary)]">Loading...</div>;
  }
  if (!company) {
    return <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">Company not found</div>;
  }

  const initial: CompanyFormValues = {
    name: company.name ?? "",
    domain: company.domain ?? "",
    industry: company.industry ?? "",
    size_range: company.size_range ?? "",
    annual_revenue: company.annual_revenue == null ? "" : String(company.annual_revenue),
    description: company.description ?? "",
    address: company.address ?? "",
    employee_count: company.employee_count == null ? "" : String(company.employee_count),
    main_contact_id: company.main_contact?.id ?? company.main_contact_id ?? "",
    social_links: (company.social_links ?? []).map((l) => ({
      platform: l.platform ?? "other",
      url: l.url ?? "",
    })),
    custom_data: (company.custom_data ?? {}) as CompanyFormValues["custom_data"],
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <Link
          href="/companies"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to companies
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
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
              aria-label="Delete company"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4">Company details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Domain</dt>
            <dd className="mt-0.5 text-sm break-all">{company.domain || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Industry</dt>
            <dd className="mt-0.5 text-sm">{company.industry || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Size range</dt>
            <dd className="mt-0.5 text-sm">{company.size_range || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Annual revenue</dt>
            <dd className="mt-0.5 text-sm tabular-nums">
              {company.annual_revenue ? `$${Number(company.annual_revenue).toLocaleString()}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Address</dt>
            <dd className="mt-0.5 text-sm">{company.address || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Employees</dt>
            <dd className="mt-0.5 text-sm tabular-nums">
              {company.employee_count != null ? Number(company.employee_count).toLocaleString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Main contact</dt>
            <dd className="mt-0.5 text-sm">
              {company.main_contact ? (
                <Link href={`/contacts/${company.main_contact.id}`} className="hover:text-[var(--accent-hover)] transition-colors">
                  {company.main_contact.first_name} {company.main_contact.last_name ?? ""}
                </Link>
              ) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Added by</dt>
            <dd className="mt-0.5 text-sm">{company.added_by?.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Added on</dt>
            <dd className="mt-0.5 text-sm">{new Date(company.created_at).toLocaleDateString()}</dd>
          </div>
          {(company.social_links ?? []).length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Social</dt>
              <dd className="mt-1.5 flex flex-wrap gap-2">
                {(company.social_links ?? []).map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-sm !px-2.5"
                    aria-label={`${l.platform} profile`}
                  >
                    <SocialIcon platform={l.platform} />
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
        {company.description && (
          <>
            <hr className="my-4 border-[var(--border-subtle)]" />
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">
              {company.description}
            </p>
          </>
        )}
      </div>

      <AiEnrich
        company={{
          ...company,
          domain: company.domain ?? "",
          industry: company.industry ?? "",
          size_range: company.size_range ?? "",
          description: company.description ?? "",
        }}
      />

      <TagEditor entity="Company" entityId={company.id} />

      <CustomFieldValues entityType="Company" values={company.custom_data} />

      <NotesSection notableType="Company" notableId={company.id} />

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit company"
        description="Update this company's details."
      >
        <FormError message={editError} />
        <CompanyForm
          initial={initial}
          companyId={company.id}
          submitting={update.isPending}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            setEditError(null);
            try {
              await update.mutateAsync({ id: company.id, ...values });
              setEditOpen(false);
            } catch (e) {
              setEditError(errMessage(e, "Could not save the company."));
            }
          }}
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setDeleteError(null);
          remove.mutate(company.id, {
            onSuccess: () => router.push("/companies"),
            onError: (e) => setDeleteError(errMessage(e, "Could not delete the company.")),
          });
        }}
        title="Delete company?"
        message={`${company.name} will be permanently removed. This action cannot be undone.`}
        confirming={remove.isPending}
        error={deleteError}
      />
    </div>
  );
}
