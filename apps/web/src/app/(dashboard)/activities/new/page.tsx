"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ActivityForm, EMPTY_ACTIVITY } from "@/components/activities/activity-form";
import { useCreateActivity } from "@/hooks/use-activities";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft } from "lucide-react";

export default function NewActivityPage() {
  const router = useRouter();
  const create = useCreateActivity();
  const [error, setError] = useState<string | null>(null);

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
        <h1 className="text-2xl font-semibold tracking-tight mt-2">New Activity</h1>
      </div>

      <div className="card p-6 space-y-4">
        <FormError message={error} />
        <ActivityForm
          initial={EMPTY_ACTIVITY}
          submitting={create.isPending}
          submitLabel="Create activity"
          onSubmit={async (values) => {
            setError(null);
            try {
              await create.mutateAsync(values);
              router.push("/activities");
            } catch (e) {
              setError(errMessage(e, "Could not create the activity."));
            }
          }}
        />
      </div>
    </div>
  );
}
