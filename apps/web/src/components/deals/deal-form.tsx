"use client";

import { useMemo, useState } from "react";
import { Field } from "@/components/forms/fields";
import { CustomFieldInputs, type CustomData } from "@/components/custom-fields/custom-field-inputs";
import { usePipelines, useStages } from "@/hooks/use-pipelines";
import { useContacts } from "@/hooks/use-contacts";
import { useCompanies } from "@/hooks/use-companies";

export interface DealFormValues {
  title: string;
  amount: string;
  pipeline_id: string;
  stage_id: string;
  contact_id: string;
  company_id: string;
  expected_close_date: string;
  probability: string;
  source: string;
  custom_data: CustomData;
}

export const EMPTY_DEAL: DealFormValues = {
  title: "",
  amount: "",
  pipeline_id: "",
  stage_id: "",
  contact_id: "",
  company_id: "",
  expected_close_date: "",
  probability: "",
  source: "",
  custom_data: {},
};

export function DealForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial: DealFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState(initial);
  const { data: pipelines } = usePipelines();
  const { data: stages } = useStages(values.pipeline_id || undefined);
  const { data: contactsRes } = useContacts({ per_page: 100 });
  const { data: companiesRes } = useCompanies({ per_page: 100 });

  const pipelineList = useMemo(
    () => (pipelines as unknown as { id: string; name: string; is_default?: boolean }[] | undefined) ?? [],
    [pipelines],
  );
  const stageList = useMemo(
    () => (stages as unknown as { id: string; name: string }[] | undefined) ?? [],
    [stages],
  );
  const contacts = ((contactsRes as unknown as { data?: { id: string; first_name: string; last_name: string }[] })?.data ?? []);
  const companies = ((companiesRes as unknown as { data?: { id: string; name: string }[] })?.data ?? []);

  const set = (key: keyof DealFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const next = e.target.value;
    setValues((v) => (key === "pipeline_id" ? { ...v, pipeline_id: next, stage_id: "" } : { ...v, [key]: next }));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title: values.title.trim(),
          amount: values.amount.trim() === "" ? null : Number(values.amount),
          pipeline_id: values.pipeline_id,
          stage_id: values.stage_id,
          contact_id: values.contact_id || null,
          company_id: values.company_id || null,
          expected_close_date: values.expected_close_date || null,
          probability: values.probability.trim() === "" ? null : Number(values.probability),
          source: values.source.trim() || null,
          custom_data: values.custom_data,
        });
      }}
    >
      <Field label="Title" htmlFor="deal-title" required>
        <input id="deal-title" className="input" value={values.title} onChange={set("title")} required />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Amount (USD)" htmlFor="deal-amount">
          <input
            id="deal-amount"
            type="number"
            min="0"
            step="0.01"
            className="input"
            value={values.amount}
            onChange={set("amount")}
          />
        </Field>
        <Field label="Probability %" htmlFor="deal-probability">
          <input
            id="deal-probability"
            type="number"
            min="0"
            max="100"
            step="1"
            className="input"
            value={values.probability}
            onChange={set("probability")}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Pipeline" htmlFor="deal-pipeline" required>
          <select id="deal-pipeline" className="input" value={values.pipeline_id} onChange={set("pipeline_id")} required>
            <option value="">Select pipeline</option>
            {pipelineList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Stage" htmlFor="deal-stage" required>
          <select
            id="deal-stage"
            className="input"
            value={values.stage_id}
            onChange={set("stage_id")}
            required
            disabled={!values.pipeline_id}
          >
            <option value="">{values.pipeline_id ? "Select stage" : "Pick a pipeline first"}</option>
            {stageList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Contact" htmlFor="deal-contact">
          <select id="deal-contact" className="input" value={values.contact_id} onChange={set("contact_id")}>
            <option value="">No contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Company" htmlFor="deal-company">
          <select id="deal-company" className="input" value={values.company_id} onChange={set("company_id")}>
            <option value="">No company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Expected close date" htmlFor="deal-close-date">
          <input
            id="deal-close-date"
            type="date"
            className="input"
            value={values.expected_close_date}
            onChange={set("expected_close_date")}
          />
        </Field>
        <Field label="Source" htmlFor="deal-source">
          <input
            id="deal-source"
            className="input"
            list="deal-source-options"
            value={values.source}
            onChange={set("source")}
            placeholder="e.g. referral"
            autoComplete="off"
          />
          <datalist id="deal-source-options">
            {["referral", "website", "cold outreach", "social", "event", "partner"].map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
      </div>
      <CustomFieldInputs
        entityType="Deal"
        values={values.custom_data}
        onChange={(custom_data) => setValues((v) => ({ ...v, custom_data }))}
      />
      <button
        type="submit"
        disabled={submitting || !values.title.trim() || !values.pipeline_id || !values.stage_id}
        className="btn-primary"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
