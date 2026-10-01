"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useContact, useDeleteContact, useUpdateContact } from "@/hooks/use-contacts";
import { useCompany } from "@/hooks/use-companies";
import { NotesSection } from "@/components/shared/notes-section";
import { TagEditor } from "@/components/shared/tag-editor";
import { CustomFieldValues } from "@/components/custom-fields/custom-field-inputs";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { ContactForm, type ContactFormValues } from "@/components/contacts/contact-form";
import { SocialIcon, type SocialLink } from "@/components/contacts/social-links-editor";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";

interface ContactData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: "lead" | "customer" | "churned" | null;
  company_id?: string | null;
  company?: { id: string; name: string } | null;
  job_title?: string | null;
  city?: string | null;
  social_links?: SocialLink[] | null;
  custom_data?: Record<string, unknown> | null;
  created_at: string;
}

export default function ContactDetailPage() {
  const routeParams = useParams<{ id: string }>();
  const id = Array.isArray(routeParams?.id) ? routeParams.id[0] : (routeParams?.id ?? "");
  const router = useRouter();
  const { data, isLoading } = useContact(id);
  const remove = useDeleteContact();
  const update = useUpdateContact();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const contact = data as unknown as ContactData | undefined;
  const { data: companyData } = useCompany(contact?.company?.id ?? contact?.company_id ?? "", {
    enabled: !!contact && !!(contact?.company?.id ?? contact?.company_id),
  });
  const company = (contact?.company ?? companyData) as unknown as { id: string; name: string } | undefined;

  if (isLoading) return <div className="text-center py-8 text-sm text-[var(--text-secondary)]">Loading...</div>;
  if (!contact) return <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">Contact not found</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <Link
          href="/contacts"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to contacts
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <h1 className="text-2xl font-semibold tracking-tight">{contact.first_name} {contact.last_name}</h1>
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
              aria-label="Delete contact"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4">Contact details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Email</dt>
            <dd className="mt-0.5 text-sm">{contact.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Phone</dt>
            <dd className="mt-0.5 text-sm">{contact.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Company</dt>
            <dd className="mt-0.5 text-sm">
              {company ? (
                <Link href={`/companies/${company.id}`} className="hover:text-[var(--accent-hover)] transition-colors">
                  {company.name}
                </Link>
              ) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Status</dt>
            <dd className="mt-0.5 text-sm capitalize">{contact.status ?? "lead"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Job title</dt>
            <dd className="mt-0.5 text-sm">{contact.job_title || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">City</dt>
            <dd className="mt-0.5 text-sm">{contact.city || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Added on</dt>
            <dd className="mt-0.5 text-sm">{new Date(contact.created_at).toLocaleDateString()}</dd>
          </div>
          {(contact.social_links ?? []).length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Social</dt>
              <dd className="mt-1.5 flex flex-wrap gap-2">
                {(contact.social_links ?? []).map((l, i) => (
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
      </div>

      <TagEditor entity="Contact" entityId={contact.id} />

      <CustomFieldValues entityType="Contact" values={contact.custom_data} />

      <NotesSection notableType="Contact" notableId={contact.id} />

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit contact"
        description="Update this contact's details."
      >
        <FormError message={editError} />
        <ContactForm
          initial={{
            first_name: contact.first_name ?? "",
            last_name: contact.last_name ?? "",
            email: contact.email ?? "",
            phone: contact.phone ?? "",
            status: contact.status ?? "lead",
            company_id: contact.company_id ?? contact.company?.id ?? "",
            job_title: contact.job_title ?? "",
            city: contact.city ?? "",
            social_links: (contact.social_links ?? []).map((l) => ({
              platform: l.platform ?? "other",
              url: l.url ?? "",
            })),
            custom_data: (contact.custom_data ?? {}) as ContactFormValues["custom_data"],
          }}
          submitting={update.isPending}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            setEditError(null);
            try {
              await update.mutateAsync({ id: contact.id, ...values });
              setEditOpen(false);
            } catch (e) {
              setEditError(errMessage(e, "Could not save the contact."));
            }
          }}
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setDeleteError(null);
          remove.mutate(contact.id, {
            onSuccess: () => router.push("/contacts"),
            onError: (e) => setDeleteError(errMessage(e, "Could not delete the contact.")),
          });
        }}
        title="Delete contact?"
        message={`${contact.first_name} ${contact.last_name ?? ""}`.trim() + " will be permanently removed. This action cannot be undone."}
        confirming={remove.isPending}
        error={deleteError}
      />
    </div>
  );
}

