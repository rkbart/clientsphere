"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ActivityForm, type ActivityFormValues } from "@/components/activities/activity-form";
import { useActivity, useUpdateActivity } from "@/hooks/use-activities";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft } from "lucide-react";

interface ActivityRecord {
  kind?: string | null;
  subject?: string | null;
  description?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  deal_id?: string | null;
  due_at?: string | null;
}

export default function EditActivityPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, isLoading } = useActivity(params.id);
  const update = useUpdateActivity();
  const [error, setError] = useState<string | null>(null);
  const activity = data as unknown as ActivityRecord | undefined;

  const initial: ActivityFormValues = {
    kind: activity?.kind ?? "task",
    subject: activity?.subject ?? "",
    description: activity?.description ?? "",
    contact_id: activity?.contact_id ?? "",
    company_id: activity?.company_id ?? "",
    deal_id: activity?.deal_id ?? "",
    due_at: (activity?.due_at ?? "").slice(0, 10),
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href="/activities"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to activities
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Edit Activity</h1>
      </div>

      <div className="card p-6 space-y-4">
        {isLoading ? (
          <div className="h-64 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] animate-pulse" />
        ) : !activity ? (
          <p className="text-sm text-[var(--text-tertiary)]">Activity not found</p>
        ) : (
          <>
            <FormError message={error} />
            <ActivityForm
              key={params.id}
              initial={initial}
              submitting={update.isPending}
              submitLabel="Save changes"
              onSubmit={async (values) => {
                setError(null);
                try {
                  await update.mutateAsync({ id: params.id, ...values });
                  router.push("/activities");
                } catch (e) {
                  setError(errMessage(e, "Could not save the activity."));
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
