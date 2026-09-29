"use client";

import { useState } from "react";
import { Field } from "@/components/forms/fields";
import { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS } from "@/hooks/use-automations";
import { usePipelines, useStages } from "@/hooks/use-pipelines";
import { useWebhooks } from "@/hooks/use-webhooks";
import { Plus, Trash2 } from "lucide-react";

export interface AutomationAction {
  type: string;
  subject?: string;
  description?: string;
  due_days?: string;
  body?: string;
  tag_name?: string;
  pipeline_id?: string;
  stage_id?: string;
  webhook_id?: string;
}

export interface AutomationFormValues {
  name: string;
  trigger_type: string;
  is_active: boolean;
  min_amount: string;
  status: string;
  tag: string;
  actions: AutomationAction[];
}

export const EMPTY_AUTOMATION: AutomationFormValues = {
  name: "",
  trigger_type: "contact_created",
  is_active: true,
  min_amount: "",
  status: "",
  tag: "",
  actions: [],
};

const BLANK_ACTION: Record<string, AutomationAction> = {
  create_task: { type: "create_task", subject: "", description: "", due_days: "1" },
  send_email: { type: "send_email", subject: "", body: "" },
  add_tag: { type: "add_tag", tag_name: "" },
  move_stage: { type: "move_stage", pipeline_id: "", stage_id: "" },
  call_webhook: { type: "call_webhook", webhook_id: "" },
};

function ActionEditor({
  action,
  index,
  onChange,
  onRemove,
}: {
  action: AutomationAction;
  index: number;
  onChange: (next: AutomationAction) => void;
  onRemove: () => void;
}) {
  const { data: pipelines } = usePipelines();
  const pipelineList = (pipelines as unknown as { id: string; name: string }[] | undefined) ?? [];
  const { data: stages } = useStages(action.pipeline_id || undefined);
  const stageList = (stages as unknown as { id: string; name: string }[] | undefined) ?? [];
  const { data: webhooksRes } = useWebhooks();
  const webhookList = ((webhooksRes as unknown as { data?: { id: string; url: string }[] })?.data ?? []);

  const set = (key: string, value: string) => onChange({ ...action, [key]: value });

  return (
    <div className="border border-[var(--border)] rounded-[var(--radius-md)] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <select
          value={action.type}
          onChange={(e) => onChange({ ...BLANK_ACTION[e.target.value] })}
          className="input flex-1"
          aria-label={`Action ${index + 1} type`}
        >
          {AUTOMATION_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button type="button" onClick={onRemove} className="btn-ghost p-2" aria-label={`Remove action ${index + 1}`}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {action.type === "create_task" && (
        <>
          <Field label="Task subject" htmlFor={`action-${index}-subject`} required>
            <input
              id={`action-${index}-subject`}
              className="input"
              value={action.subject ?? ""}
              onChange={(e) => set("subject", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Description" htmlFor={`action-${index}-description`}>
              <input
                id={`action-${index}-description`}
                className="input"
                value={action.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <Field label="Due in (days)" htmlFor={`action-${index}-due`}>
              <input
                id={`action-${index}-due`}
                type="number"
                min="0"
                className="input"
                value={action.due_days ?? ""}
                onChange={(e) => set("due_days", e.target.value)}
              />
            </Field>
          </div>
        </>
      )}

      {action.type === "send_email" && (
        <>
          <Field label="Subject" htmlFor={`action-${index}-email-subject`} required>
            <input
              id={`action-${index}-email-subject`}
              className="input"
              value={action.subject ?? ""}
              onChange={(e) => set("subject", e.target.value)}
            />
          </Field>
          <Field label="Body" htmlFor={`action-${index}-email-body`}>
            <textarea
              id={`action-${index}-email-body`}
              className="input resize-y"
              rows={3}
              value={action.body ?? ""}
              onChange={(e) => set("body", e.target.value)}
              placeholder="Supports {{first_name}}, {{last_name}}, {{email}}, {{company}}"
            />
          </Field>
        </>
      )}

      {action.type === "add_tag" && (
        <Field label="Tag name" htmlFor={`action-${index}-tag`} required>
          <input
            id={`action-${index}-tag`}
            className="input"
            value={action.tag_name ?? ""}
            onChange={(e) => set("tag_name", e.target.value)}
          />
        </Field>
      )}

      {action.type === "move_stage" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pipeline" htmlFor={`action-${index}-pipeline`}>
            <select
              id={`action-${index}-pipeline`}
              className="input"
              value={action.pipeline_id ?? ""}
              onChange={(e) => onChange({ ...action, pipeline_id: e.target.value, stage_id: "" })}
            >
              <option value="">Select pipeline</option>
              {pipelineList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Stage" htmlFor={`action-${index}-stage`}>
            <select
              id={`action-${index}-stage`}
              className="input"
              value={action.stage_id ?? ""}
              onChange={(e) => set("stage_id", e.target.value)}
              disabled={!action.pipeline_id}
            >
              <option value="">Select stage</option>
              {stageList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {action.type === "call_webhook" && (
        <Field label="Webhook" htmlFor={`action-${index}-webhook`}>
          <select
            id={`action-${index}-webhook`}
            className="input"
            value={action.webhook_id ?? ""}
            onChange={(e) => set("webhook_id", e.target.value)}
          >
            <option value="">Select webhook</option>
            {webhookList.map((w) => (
              <option key={w.id} value={w.id}>
                {w.url}
              </option>
            ))}
          </select>
        </Field>
      )}
    </div>
  );
}

export function AutomationForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial: AutomationFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState(initial);

  const updateAction = (index: number, next: AutomationAction) =>
    setValues((v) => ({ ...v, actions: v.actions.map((a, i) => (i === index ? next : a)) }));

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const conditions: Record<string, string> = {};
        if (values.min_amount.trim()) conditions.min_amount = values.min_amount.trim();
        if (values.status.trim()) conditions.status = values.status.trim();
        if (values.tag.trim()) conditions.tag = values.tag.trim();
        onSubmit({
          name: values.name.trim(),
          trigger_type: values.trigger_type,
          is_active: values.is_active,
          conditions,
          actions: values.actions.map((a) => {
            const { pipeline_id, ...rest } = a;
            void pipeline_id;
            return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== ""));
          }),
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name" htmlFor="automation-name" required>
          <input
            id="automation-name"
            className="input"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            required
          />
        </Field>
        <Field label="Trigger" htmlFor="automation-trigger">
          <select
            id="automation-trigger"
            className="input"
            value={values.trigger_type}
            onChange={(e) => setValues((v) => ({ ...v, trigger_type: e.target.value }))}
          >
            {AUTOMATION_TRIGGERS.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={values.is_active}
          onChange={(e) => setValues((v) => ({ ...v, is_active: e.target.checked }))}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        Active — run on matching events
      </label>

      <div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1.5">Conditions (all must match; blank = ignore)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Min deal amount" htmlFor="automation-min-amount">
            <input
              id="automation-min-amount"
              type="number"
              min="0"
              className="input"
              value={values.min_amount}
              onChange={(e) => setValues((v) => ({ ...v, min_amount: e.target.value }))}
            />
          </Field>
          <Field label="Status equals" htmlFor="automation-status">
            <input
              id="automation-status"
              className="input"
              value={values.status}
              onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}
              placeholder="lead"
            />
          </Field>
          <Field label="Has tag" htmlFor="automation-tag">
            <input
              id="automation-tag"
              className="input"
              value={values.tag}
              onChange={(e) => setValues((v) => ({ ...v, tag: e.target.value }))}
              placeholder="hot-lead"
            />
          </Field>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--text-primary)]">Actions ({values.actions.length})</p>
          <button
            type="button"
            onClick={() => setValues((v) => ({ ...v, actions: [...v.actions, { ...BLANK_ACTION.create_task }] }))}
            className="btn-secondary text-sm"
          >
            <Plus className="h-4 w-4" />
            Add action
          </button>
        </div>
        {values.actions.map((a, i) => (
          <ActionEditor
            key={i}
            action={a}
            index={i}
            onChange={(next) => updateAction(i, next)}
            onRemove={() => setValues((v) => ({ ...v, actions: v.actions.filter((_, j) => j !== i) }))}
          />
        ))}
        {values.actions.length === 0 && (
          <p className="text-sm text-[var(--text-tertiary)]">No actions yet — the automation will only log runs.</p>
        )}
      </div>

      <button type="submit" disabled={submitting || !values.name.trim()} className="btn-primary">
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
