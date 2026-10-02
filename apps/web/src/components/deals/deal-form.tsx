"use client";

import { useMemo, useState } from "react";
import { Field } from "@/components/forms/fields";
import { CustomFieldInputs, type CustomData } from "@/components/custom-fields/custom-field-inputs";
import { usePipelines, useStages } from "@/hooks/use-pipelines";
import { useContacts } from "@/hooks/use-contacts";
import { useCompanies } from "@/hooks/use-companies";
import { CUSTOM_SOURCE, DEAL_SOURCES, isKnownSource } from "@/lib/deals/sources";

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
    () => (stages as unknown as { id: string; name: string; probability?: number | null }[] | undefined) ?? [],
    [stages],
  );
  const contacts = ((contactsRes as unknown as { data?: { id: string; first_name: string; last_name: string }[] })?.data ?? []);
  const companies = ((companiesRes as unknown as { data?: { id: string; name: string }[] })?.data ?? []);

  // `deals.source` is free text. "Others" swaps the select for a text input so
  // new sources stay possible, and a deal that already holds an unknown value
  // opens straight into that input rather than being rewritten to a default.
  const [customSource, setCustomSource] = useState(
    () => !!initial.source && !isKnownSource(initial.source),
  );

  const set = (key: keyof DealFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const next = e.target.value;
    setValues((v) => (key === "pipeline_id" ? { ...v, pipeline_id: next, stage_id: "" } : { ...v, [key]: next }));
  };

  // Stage drives probability: when the stage changes and the field is blank
  // or still holds the previous stage default, fill in the new default.
  // An explicitly typed value is left alone. The backend enforces the same.
  const setStage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setValues((v) => {
      const oldDefault = stageList.find((s) => s.id === v.stage_id)?.probability;
      const nextDefault = stageList.find((s) => s.id === next)?.probability;
      const untouched = v.probability === "" || (oldDefault != null && v.probability === String(oldDefault));
      return {
        ...v,
        stage_id: next,
        probability: untouched && nextDefault != null ? String(nextDefault) : v.probability,
      };
    });
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
            onChange={setStage}
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
          <select
            id="deal-source"
            className="input"
            value={customSource ? CUSTOM_SOURCE : values.source}
            onChange={(e) => {
              const next = e.target.value;
              if (next === CUSTOM_SOURCE) {
                setCustomSource(true);
                // Switching away from a listed option starts the custom value blank.
                setValues((v) => ({ ...v, source: isKnownSource(v.source) ? "" : v.source }));
              } else {
                setCustomSource(false);
                setValues((v) => ({ ...v, source: next }));
              }
            }}
          >
            <option value="">None</option>
            {DEAL_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value={CUSTOM_SOURCE}>Others</option>
          </select>
          {customSource && (
            <input
              className="input mt-2"
              value={values.source}
              onChange={(e) => setValues((v) => ({ ...v, source: e.target.value }))}
              placeholder="Enter a custom source"
              aria-label="Custom source"
              autoComplete="off"
            />
          )}
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
