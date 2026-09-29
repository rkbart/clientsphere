"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AutomationForm, EMPTY_AUTOMATION } from "@/components/automations/automation-form";
import { useCreateAutomation } from "@/hooks/use-automations";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft } from "lucide-react";

export default function NewAutomationPage() {
  const router = useRouter();
  const create = useCreateAutomation();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href="/automations"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to automations
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">New Automation</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Events fire while the app is running (jobs run in-process).
        </p>
      </div>

      <div className="card p-6 space-y-4">
        <FormError message={error} />
        <AutomationForm
          initial={EMPTY_AUTOMATION}
          submitting={create.isPending}
          submitLabel="Create automation"
          onSubmit={async (values) => {
            setError(null);
            try {
              const result = (await create.mutateAsync(values)) as unknown as { id: string };
              router.push(`/automations/${result.id}/edit`);
            } catch (e) {
              setError(errMessage(e, "Could not create the automation."));
            }
          }}
        />
      </div>
    </div>
  );
}
