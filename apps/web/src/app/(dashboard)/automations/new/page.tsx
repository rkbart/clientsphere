"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WorkflowBuilder, type WorkflowValues } from "@/components/automations/workflow-builder";
import { useAutomationTemplates, useCreateAutomation, type AutomationTemplate } from "@/hooks/use-automations";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/error";
import { Check, ChevronDown, ChevronLeft, LayoutTemplate, Zap } from "lucide-react";

const EMPTY_WORKFLOW: WorkflowValues = {
  name: "",
  trigger_type: "contact_created",
  is_active: true,
  delay_days: "",
  min_amount: "",
  status: "",
  tag: "",
  actions: [],
};

function templateToWorkflow(t: AutomationTemplate): WorkflowValues {
  return {
    name: t.name,
    trigger_type: t.trigger_type,
    is_active: true,
    delay_days: String(t.delay_days ?? 0),
    min_amount: t.conditions?.min_amount ?? "",
    status: t.conditions?.status ?? "",
    tag: t.conditions?.tag ?? "",
    actions: (t.actions ?? []).map((a) => ({
      type: a.type ?? "create_task",
      subject: a.subject ?? "",
      description: a.description ?? "",
      due_days: a.due_days ?? "",
      body: a.body ?? "",
      tag_name: a.tag_name ?? "",
      pipeline_id: "",
      stage_id: a.stage_id ?? "",
      webhook_id: a.webhook_id ?? "",
    })),
  };
}

export default function NewAutomationPage() {
  const router = useRouter();
  const create = useCreateAutomation();
  const { data: templates } = useAutomationTemplates();
  const [error, setError] = useState<string | null>(null);
  const [templateKey, setTemplateKey] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(true);

  const activeTemplate = (templates ?? []).find((t) => t.key === templateKey) ?? null;
  const initial = activeTemplate ? templateToWorkflow(activeTemplate) : EMPTY_WORKFLOW;

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

      {(templates ?? []).length > 0 && (
        <div className="card p-6 space-y-4">
          <button
            type="button"
            onClick={() => setTemplatesOpen((o) => !o)}
            aria-expanded={templatesOpen}
            className="w-full flex items-center gap-2 text-left"
          >
            <LayoutTemplate className="h-4 w-4 text-[var(--text-secondary)]" />
            <h2 className="text-sm font-semibold flex-1">Start from a template</h2>
            {templateKey && (
              <span className="text-xs text-[var(--text-secondary)] font-normal">
                {(templates ?? []).find((t) => t.key === templateKey)?.name}
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${templatesOpen ? "" : "-rotate-90"}`}
            />
          </button>
          {templatesOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(templates ?? []).map((t) => {
                const selected = t.key === templateKey;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTemplateKey(selected ? null : t.key)}
                    aria-pressed={selected}
                    className={`text-left border rounded-[var(--radius-md)] p-4 transition-colors ${
                      selected
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      {selected && <Check className="h-3.5 w-3.5 text-[var(--accent)]" />}
                      {t.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                      {t.description}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-2 capitalize">
                      {t.trigger_type.replace(/_/g, " ")}
                      {t.delay_days > 0 ? ` · +${t.delay_days}d delay` : ""}
                      {` · ${t.actions.length} action${t.actions.length === 1 ? "" : "s"}`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="card p-6 space-y-4">
        <FormError message={error} />
        {activeTemplate && (
          <div className="flex items-center justify-between gap-3 pb-1">
            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Using template: <span className="font-medium text-[var(--text-primary)]">{activeTemplate.name}</span>
            </p>
            <button
              type="button"
              onClick={() => setTemplateKey(null)}
              className="btn-ghost text-sm shrink-0"
            >
              Start blank
            </button>
          </div>
        )}
        <WorkflowBuilder
          key={templateKey ?? "blank"}
          initial={initial}
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
