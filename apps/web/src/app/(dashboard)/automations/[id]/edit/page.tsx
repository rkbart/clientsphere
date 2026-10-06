"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { WorkflowBuilder, type WorkflowValues } from "@/components/automations/workflow-builder";
import { useAutomation, useUpdateAutomation, useAutomationRuns } from "@/hooks/use-automations";
import { FormError } from "@/components/forms/fields";
import { ResultModal } from "@/components/ui/modal";
import { errMessage } from "@/lib/error";
import { ChevronLeft } from "lucide-react";

interface AutomationRecord {
  name?: string | null;
  trigger_type?: string | null;
  is_active?: boolean;
  delay_days?: number | null;
  conditions?: Record<string, string> | null;
  actions?: Record<string, string>[] | null;
}

interface Run {
  id: string;
  status: string;
  trigger_data?: { record_type?: string; record_id?: string };
  result?: { error?: string };
  ran_at?: string | null;
  created_at: string;
}

const RUN_BADGE: Record<string, string> = {
  completed: "badge-success",
  failed: "badge-danger",
  running: "badge-info",
};

export default function EditAutomationPage() {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const id = Array.isArray(routeParams?.id) ? routeParams.id[0] : (routeParams?.id ?? "");
  const { data, isLoading } = useAutomation(id);
  const { data: runsRes } = useAutomationRuns(id);
  const update = useUpdateAutomation();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ tone: "success" | "error"; title: string; message: string; next?: string } | null>(
    null
  );
  const automation = data as unknown as AutomationRecord | undefined;
  const runs = ((runsRes as unknown as { data?: Run[] })?.data ?? []);

  const initial: WorkflowValues = {
    name: automation?.name ?? "",
    trigger_type: automation?.trigger_type ?? "contact_created",
    is_active: automation?.is_active ?? true,
    delay_days: automation?.delay_days != null ? String(automation.delay_days) : "",
    min_amount: automation?.conditions?.min_amount ?? "",
    status: automation?.conditions?.status ?? "",
    tag: automation?.conditions?.tag ?? "",
    actions: (automation?.actions ?? []).map((a) => ({
      type: a.type ?? "create_task",
      subject: a.subject ?? "",
      description: a.description ?? "",
      due_days: a.due_days ?? "",
      body: a.body ?? "",
      tag_name: a.tag_name ?? "",
      pipeline_id: a.pipeline_id ?? "",
      stage_id: a.stage_id ?? "",
      webhook_id: a.webhook_id ?? "",
    })),
  };

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
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Edit Automation</h1>
      </div>

      <div className="card p-6 space-y-4">
        {isLoading ? (
          <div className="h-64 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] animate-pulse" />
        ) : !automation ? (
          <p className="text-sm text-[var(--text-tertiary)]">Automation not found</p>
        ) : (
          <>
            <FormError message={error} />
            <WorkflowBuilder
              key={id}
              initial={initial}
              onSubmit={async (values) => {
                setError(null);
                try {
                  await update.mutateAsync({ id, ...values });
                  setResult({
                    tone: "success",
                    title: "Automation saved",
                    message: `“${values.name}” was updated successfully.`,
                    next: "/automations",
                  });
                } catch (e) {
                  setError(errMessage(e, "Could not save the automation."));
                }
              }}
            />
          </>
        )}
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-sm font-semibold">Recent runs ({runs.length})</h2>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {runs.slice(0, 10).map((run) => (
            <div key={run.id} className="px-5 py-3 flex items-center gap-3">
              <span className={`badge ${RUN_BADGE[run.status] ?? "badge-neutral"}`}>{run.status}</span>
              <span className="text-sm flex-1 truncate">
                {run.trigger_data?.record_type ?? "—"}
                {run.result?.error ? ` — ${run.result.error}` : ""}
              </span>
              <span className="text-xs text-[var(--text-tertiary)] shrink-0">
                {new Date(run.ran_at ?? run.created_at).toLocaleString()}
              </span>
            </div>
          ))}
          {runs.length === 0 && (
            <p className="px-5 py-6 text-sm text-[var(--text-tertiary)] text-center">
              No runs yet — runs appear here when the trigger fires.
            </p>
          )}
        </div>
      </div>

      <ResultModal
        open={!!result}
        onClose={() => {
          const next = result?.next;
          setResult(null);
          if (next) router.push(next);
        }}
        tone={result?.tone ?? "success"}
        title={result?.title ?? ""}
        message={result?.message ?? ""}
      />
    </div>
  );
}
