"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, FormError } from "@/components/forms/fields";
import {
  useSequence,
  useUpdateSequence,
  useSequenceSteps,
  useCreateStep,
  useUpdateStep,
  useDeleteStep,
  useEnrollContact,
  useEnrollments,
  useUnsubscribeEnrollment,
} from "@/hooks/use-sequences";
import { useContacts } from "@/hooks/use-contacts";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft, Pencil, Trash2, Plus } from "lucide-react";

interface Step {
  id: string;
  step_order: number;
  delay_days: number;
  subject: string;
  body: string;
}

interface Enrollment {
  id: string;
  contact_id: string;
  current_step: number;
  status: string;
  next_send_at?: string | null;
}

const ENROLL_BADGE: Record<string, string> = {
  active: "badge-info",
  paused: "badge-neutral",
  completed: "badge-success",
  unsubscribed: "badge-warning",
};

function StepRow({
  step,
  sequenceId,
}: {
  step: Step;
  sequenceId: string;
}) {
  const update = useUpdateStep(sequenceId);
  const remove = useDeleteStep(sequenceId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    delay_days: String(step.delay_days),
    subject: step.subject,
    body: step.body,
  });
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <li className="flex items-start gap-3 px-5 py-4">
        <span className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
          {step.step_order}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{step.subject}</p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {step.delay_days === 0 ? "Sends immediately" : `Waits ${step.delay_days} day${step.delay_days === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex shrink-0">
          <button onClick={() => setEditing(true)} className="btn-ghost p-2" aria-label={`Edit step ${step.step_order}`}>
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={async () => {
              if (!confirm(`Delete step ${step.step_order}?`)) return;
              setError(null);
              try {
                await remove.mutateAsync(step.id);
              } catch (e) {
                setError(errMessage(e, "Could not delete the step."));
              }
            }}
            className="btn-ghost p-2"
            aria-label={`Delete step ${step.step_order}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </li>
    );
  }

  return (
    <li className="px-5 py-4 space-y-3 bg-[var(--bg-elevated)]/50">
      <FormError message={error} />
      <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-3">
        <Field label="Delay (days)" htmlFor={`step-${step.id}-delay`}>
          <input
            id={`step-${step.id}-delay`}
            type="number"
            min="0"
            className="input"
            value={form.delay_days}
            onChange={(e) => setForm((f) => ({ ...f, delay_days: e.target.value }))}
          />
        </Field>
        <Field label="Subject" htmlFor={`step-${step.id}-subject`}>
          <input
            id={`step-${step.id}-subject`}
            className="input"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />
        </Field>
      </div>
      <Field label="Body" htmlFor={`step-${step.id}-body`}>
        <textarea
          id={`step-${step.id}-body`}
          className="input resize-y"
          rows={3}
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
        />
      </Field>
      <div className="flex gap-2">
        <button
          onClick={async () => {
            setError(null);
            try {
              await update.mutateAsync({
                id: step.id,
                delay_days: Number(form.delay_days) || 0,
                subject: form.subject.trim(),
                body: form.body,
              });
              setEditing(false);
            } catch (e) {
              setError(errMessage(e, "Could not save the step."));
            }
          }}
          disabled={update.isPending || !form.subject.trim()}
          className="btn-primary text-sm"
        >
          {update.isPending ? "Saving…" : "Save step"}
        </button>
        <button onClick={() => setEditing(false)} className="btn-secondary text-sm">
          Cancel
        </button>
      </div>
    </li>
  );
}

export default function SequenceDetailPage({ params }: { params: { id: string } }) {
  const { data: sequence } = useSequence(params.id);
  const update = useUpdateSequence();
  const { data: stepsRes } = useSequenceSteps(params.id);
  const createStep = useCreateStep(params.id);
  const enroll = useEnrollContact(params.id);
  const { data: enrollmentsRes } = useEnrollments(params.id);
  const unsubscribe = useUnsubscribeEnrollment(params.id);
  const { data: contactsRes } = useContacts({ per_page: 100 });
  const [error, setError] = useState<string | null>(null);
  const [contactId, setContactId] = useState("");

  const seq = sequence as unknown as { name?: string; is_active?: boolean } | undefined;
  const steps = ((stepsRes as unknown as Step[] | undefined) ?? []).slice().sort((a, b) => a.step_order - b.step_order);
  const enrollments = ((enrollmentsRes as unknown as { data?: Enrollment[] })?.data ?? []);
  const contacts = ((contactsRes as unknown as { data?: { id: string; first_name: string; last_name: string }[] })?.data ?? []);
  const contactName = (id: string) => {
    const c = contacts.find((x) => x.id === id);
    return c ? `${c.first_name} ${c.last_name}` : id.slice(0, 8);
  };
  const nextOrder = steps.length === 0 ? 1 : Math.max(...steps.map((s) => s.step_order)) + 1;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <Link
          href="/sequences"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to sequences
        </Link>
        <div className="flex items-center justify-between gap-4 mt-2">
          <h1 className="text-2xl font-semibold tracking-tight">{seq?.name ?? "Sequence"}</h1>
          {seq && (
            <label className="flex items-center gap-2 text-sm cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={seq.is_active ?? false}
                onChange={async (e) => {
                  setError(null);
                  try {
                    await update.mutateAsync({ id: params.id, is_active: e.target.checked });
                  } catch (err) {
                    setError(errMessage(err, "Could not update the sequence."));
                  }
                }}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Active
            </label>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <div className="card">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-sm font-semibold">Steps ({steps.length})</h2>
          <button
            onClick={async () => {
              setError(null);
              try {
                await createStep.mutateAsync({
                  step_order: nextOrder,
                  delay_days: nextOrder === 1 ? 0 : 1,
                  subject: "New step",
                  body: "Hi {{first_name}},",
                });
              } catch (e) {
                setError(errMessage(e, "Could not add a step."));
              }
            }}
            disabled={createStep.isPending}
            className="btn-secondary text-sm"
          >
            <Plus className="h-4 w-4" />
            Add step
          </button>
        </div>
        <ul className="divide-y divide-[var(--border-subtle)]">
          {steps.map((s) => (
            <StepRow key={s.id} step={s} sequenceId={params.id} />
          ))}
          {steps.length === 0 && (
            <li className="px-5 py-6 text-sm text-[var(--text-tertiary)] text-center">
              No steps yet — add the first one. Use {"{{first_name}}"} style placeholders.
            </li>
          )}
        </ul>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-sm font-semibold">Enroll a contact</h2>
        </div>
        <div className="p-5 flex flex-col sm:flex-row gap-2">
          <select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="input flex-1"
            aria-label="Contact to enroll"
          >
            <option value="">Select contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
          <button
            onClick={async () => {
              if (!contactId) return;
              setError(null);
              try {
                await enroll.mutateAsync(contactId);
                setContactId("");
              } catch (e) {
                setError(errMessage(e, "Could not enroll the contact."));
              }
            }}
            disabled={enroll.isPending || !contactId || steps.length === 0}
            className="btn-primary text-sm"
            title={steps.length === 0 ? "Add a step first" : undefined}
          >
            {enroll.isPending ? "Enrolling…" : "Enroll"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-sm font-semibold">Enrollments ({enrollments.length})</h2>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {enrollments.map((enr) => (
            <div key={enr.id} className="px-5 py-3 flex items-center gap-3">
              <span className={`badge ${ENROLL_BADGE[enr.status] ?? "badge-neutral"}`}>{enr.status}</span>
              <span className="text-sm flex-1 truncate">
                {contactName(enr.contact_id)} · step {enr.current_step}
              </span>
              {enr.status === "active" && (
                <button
                  onClick={async () => {
                    setError(null);
                    try {
                      await unsubscribe.mutateAsync(enr.id);
                    } catch (e) {
                      setError(errMessage(e, "Could not unsubscribe."));
                    }
                  }}
                  className="btn-ghost text-xs border border-[var(--border)]"
                >
                  Unsubscribe
                </button>
              )}
            </div>
          ))}
          {enrollments.length === 0 && (
            <p className="px-5 py-6 text-sm text-[var(--text-tertiary)] text-center">No enrollments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
