"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ContactForm, EMPTY_CONTACT } from "@/components/contacts/contact-form";
import { useCreateContact } from "@/hooks/use-contacts";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft } from "lucide-react";

export default function NewContactPage() {
  const router = useRouter();
  const create = useCreateContact();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href="/contacts"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to contacts
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">New Contact</h1>
      </div>

      <div className="card p-6 space-y-4">
        <FormError message={error} />
        <ContactForm
          initial={EMPTY_CONTACT}
          submitting={create.isPending}
          submitLabel="Create contact"
          onSubmit={async (values) => {
            setError(null);
            try {
              const result = (await create.mutateAsync(values)) as unknown as { id: string };
              router.push(`/contacts/${result.id}`);
            } catch (e) {
              setError(errMessage(e, "Could not create the contact."));
            }
          }}
        />
      </div>
    </div>
  );
}
