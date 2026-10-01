"use client";

import { useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Mail,
  Play,
  Plus,
  Tag,
  Trash2,
  Webhook,
  Zap,
} from "lucide-react";
import { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS } from "@/hooks/use-automations";
import { usePipelines, useStages } from "@/hooks/use-pipelines";
import { useWebhooks } from "@/hooks/use-webhooks";
import { Field } from "@/components/forms/fields";

export interface WorkflowAction {
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

export interface WorkflowValues {
  name: string;
  trigger_type: string;
  is_active: boolean;
  delay_days: string;
  min_amount: string;
  status: string;
  tag: string;
  actions: WorkflowAction[];
}

const TRIGGER_ICONS: Record<string, typeof Zap> = {
  contact_created: Zap,
  contact_updated: Zap,
  deal_created: Zap,
  deal_stage_changed: GitBranch,
  deal_won: CheckCircle2,
  deal_lost: CheckCircle2,
  activity_completed: CheckCircle2,
  activity_overdue: Bell,
};

const ACTION_ICONS: Record<string, typeof Zap> = {
  create_task: CheckCircle2,
  send_email: Mail,
  add_tag: Tag,
  move_stage: GitBranch,
  call_webhook: Webhook,
};

const BLANK_ACTION: Record<string, WorkflowAction> = {
  create_task: { type: "create_task", subject: "", description: "", due_days: "1" },
  send_email: { type: "send_email", subject: "", body: "" },
  add_tag: { type: "add_tag", tag_name: "" },
  move_stage: { type: "move_stage", pipeline_id: "", stage_id: "" },
  call_webhook: { type: "call_webhook", webhook_id: "" },
};

function NodeCard({
  icon: Icon,
  title,
  subtitle,
  color,
  isFirst,
  isLast,
}: {
  icon: typeof Zap;
  title: string;
  subtitle: string;
  color: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {!isFirst && <div className="w-px h-6 bg-[var(--border)] mx-auto" />}
      <div className={`flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] ${isLast ? "" : ""}`}>
        <div className={`p-2 rounded-[var(--radius-sm)] ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>
        </div>
      </div>
      {!isLast && <div className="w-px h-6 bg-[var(--border)] mx-auto" />}
    </div>
  );
}

function ActionNode({
  action,
  index,
  onUpdate,
  onRemove,
}: {
  action: WorkflowAction;
  index: number;
  onUpdate: (next: WorkflowAction) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ACTION_ICONS[action.type] ?? Zap;
  const { data: pipelines } = usePipelines();
  const pipelineList = (pipelines as unknown as { id: string; name: string }[] | undefined) ?? [];
  const { data: stages } = useStages(action.pipeline_id || undefined);
  const stageList = (stages as unknown as { id: string; name: string }[] | undefined) ?? [];
  const { data: webhooksRes } = useWebhooks();
  const webhookList = ((webhooksRes as unknown as { data?: { id: string; url: string }[] })?.data ?? []);

  const set = (key: string, value: string) => onUpdate({ ...action, [key]: value });

  return (
    <div className="flex items-center gap-3">
      <div className="w-px h-6 bg-[var(--border)] mx-auto" />
      <div className="flex-1 border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 p-3 hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--accent-soft)]">
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium capitalize">{action.type.replace(/_/g, " ")}</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {action.type === "create_task" && action.subject}
              {action.type === "send_email" && action.subject}
              {action.type === "add_tag" && action.tag_name}
              {action.type === "move_stage" && stageList.find((s) => s.id === action.stage_id)?.name}
              {action.type === "call_webhook" && webhookList.find((w) => w.id === action.webhook_id)?.url}
            </p>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expanded && (
          <div className="p-3 pt-0 space-y-3 border-t border-[var(--border-subtle)]">
            {action.type === "create_task" && (
              <>
                <Field label="Task subject" htmlFor={`wf-action-${index}-subject`} required>
                  <input
                    id={`wf-action-${index}-subject`}
                    className="input"
                    value={action.subject ?? ""}
                    onChange={(e) => set("subject", e.target.value)}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Description" htmlFor={`wf-action-${index}-description`}>
                    <input
                      id={`wf-action-${index}-description`}
                      className="input"
                      value={action.description ?? ""}
                      onChange={(e) => set("description", e.target.value)}
                    />
                  </Field>
                  <Field label="Due in (days)" htmlFor={`wf-action-${index}-due`}>
                    <input
                      id={`wf-action-${index}-due`}
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
                <Field label="Subject" htmlFor={`wf-action-${index}-email-subject`} required>
                  <input
                    id={`wf-action-${index}-email-subject`}
                    className="input"
                    value={action.subject ?? ""}
                    onChange={(e) => set("subject", e.target.value)}
                  />
                </Field>
                <Field label="Body" htmlFor={`wf-action-${index}-email-body`}>
                  <textarea
                    id={`wf-action-${index}-email-body`}
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
              <Field label="Tag name" htmlFor={`wf-action-${index}-tag`} required>
                <input
                  id={`wf-action-${index}-tag`}
                  className="input"
                  value={action.tag_name ?? ""}
                  onChange={(e) => set("tag_name", e.target.value)}
                />
              </Field>
            )}
            {action.type === "move_stage" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pipeline" htmlFor={`wf-action-${index}-pipeline`}>
                  <select
                    id={`wf-action-${index}-pipeline`}
                    className="input"
                    value={action.pipeline_id ?? ""}
                    onChange={(e) => onUpdate({ ...action, pipeline_id: e.target.value, stage_id: "" })}
                  >
                    <option value="">Select pipeline</option>
                    {pipelineList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Stage" htmlFor={`wf-action-${index}-stage`}>
                  <select
                    id={`wf-action-${index}-stage`}
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
              <Field label="Webhook" htmlFor={`wf-action-${index}-webhook`}>
                <select
                  id={`wf-action-${index}-webhook`}
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
            <button
              type="button"
              onClick={onRemove}
              className="btn-ghost text-sm text-[var(--danger)]"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function WorkflowBuilder({
  initial,
  onSubmit,
}: {
  initial: WorkflowValues;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState(initial);
  const [showAddAction, setShowAddAction] = useState(false);

  const triggerIcon = TRIGGER_ICONS[values.trigger_type] ?? Zap;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(values.actions);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setValues((v) => ({ ...v, actions: items }));
  };

  const updateAction = (index: number, next: WorkflowAction) =>
    setValues((v) => ({ ...v, actions: v.actions.map((a, i) => (i === index ? next : a)) }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name" htmlFor="wf-name" required>
          <input
            id="wf-name"
            className="input"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            required
          />
        </Field>
        <Field label="Trigger" htmlFor="wf-trigger">
          <select
            id="wf-trigger"
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

      <Field label="Delay (days)" htmlFor="wf-delay">
        <input
          id="wf-delay"
          type="number"
          min="0"
          className="input"
          value={values.delay_days}
          onChange={(e) => setValues((v) => ({ ...v, delay_days: e.target.value }))}
          placeholder="0"
        />
      </Field>

      <div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-1.5">Conditions (all must match; blank = ignore)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Min deal amount" htmlFor="wf-min-amount">
            <input
              id="wf-min-amount"
              type="number"
              min="0"
              className="input"
              value={values.min_amount}
              onChange={(e) => setValues((v) => ({ ...v, min_amount: e.target.value }))}
            />
          </Field>
          <Field label="Status equals" htmlFor="wf-status">
            <input
              id="wf-status"
              className="input"
              value={values.status}
              onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}
              placeholder="lead"
            />
          </Field>
          <Field label="Has tag" htmlFor="wf-tag">
            <input
              id="wf-tag"
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
          <p className="text-sm font-medium text-[var(--text-primary)]">Workflow</p>
        </div>

        <NodeCard
          icon={triggerIcon}
          title="Trigger"
          subtitle={values.trigger_type.replace(/_/g, " ")}
          color="bg-blue-100 text-blue-700"
          isFirst
        />

        <NodeCard
          icon={GitBranch}
          title="Conditions"
          subtitle={[values.min_amount && `min $${values.min_amount}`, values.status && `status: ${values.status}`, values.tag && `tag: ${values.tag}`].filter(Boolean).join(", ") || "none"}
          color="bg-amber-100 text-amber-700"
        />

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="actions">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-0">
                {values.actions.map((action, index) => (
                  <Draggable key={index} draggableId={`action-${index}`} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ActionNode
                          action={action}
                          index={index}
                          onUpdate={(next) => updateAction(index, next)}
                          onRemove={() =>
                            setValues((v) => ({ ...v, actions: v.actions.filter((_, i) => i !== index) }))
                          }
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {showAddAction ? (
          <div className="flex flex-wrap gap-2">
            {AUTOMATION_ACTIONS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setValues((v) => ({ ...v, actions: [...v.actions, { ...BLANK_ACTION[type] }] }));
                  setShowAddAction(false);
                }}
                className="btn-secondary text-sm capitalize"
              >
                {type.replace(/_/g, " ")}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowAddAction(false)}
              className="btn-ghost text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddAction(true)}
            className="btn-secondary text-sm"
          >
            <Plus className="h-4 w-4" />
            Add action
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          const conditions: Record<string, string> = {};
          if (values.min_amount.trim()) conditions.min_amount = values.min_amount.trim();
          if (values.status.trim()) conditions.status = values.status.trim();
          if (values.tag.trim()) conditions.tag = values.tag.trim();
          onSubmit({
            name: values.name.trim(),
            trigger_type: values.trigger_type,
            is_active: values.is_active,
            delay_days: parseInt(values.delay_days) || 0,
            conditions,
            actions: values.actions.map((a) => {
              const { pipeline_id, ...rest } = a;
              void pipeline_id;
              return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== ""));
            }),
          });
        }}
        disabled={!values.name.trim()}
        className="btn-primary"
      >
        Save workflow
      </button>
    </div>
  );
}
