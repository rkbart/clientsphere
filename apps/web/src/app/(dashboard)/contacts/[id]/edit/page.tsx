"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ContactForm, type ContactFormValues } from "@/components/contacts/contact-form";
import { useContact, useUpdateContact } from "@/hooks/use-contacts";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft } from "lucide-react";

interface ContactRecord {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  company_id?: string | null;
}

export default function EditContactPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, isLoading } = useContact(params.id);
  const update = useUpdateContact();
  const [error, setError] = useState<string | null>(null);
  const contact = data as unknown as ContactRecord | undefined;

  const initial: ContactFormValues = {
    first_name: contact?.first_name ?? "",
    last_name: contact?.last_name ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    status: contact?.status ?? "lead",
    company_id: contact?.company_id ?? "",
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href={`/contacts/${params.id}`}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to contact
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Edit Contact</h1>
      </div>

      <div className="card p-6 space-y-4">
        {isLoading ? (
          <div className="h-64 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] animate-pulse" />
        ) : !contact ? (
          <p className="text-sm text-[var(--text-tertiary)]">Contact not found</p>
        ) : (
          <>
            <FormError message={error} />
            <ContactForm
              key={params.id}
              initial={initial}
              submitting={update.isPending}
              submitLabel="Save changes"
              onSubmit={async (values) => {
                setError(null);
                try {
                  await update.mutateAsync({ id: params.id, ...values });
                  router.push(`/contacts/${params.id}`);
                } catch (e) {
                  setError(errMessage(e, "Could not save the contact."));
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
