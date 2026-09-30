"use client";

import { useState } from "react";
import { Field } from "@/components/forms/fields";
import { CustomFieldInputs, type CustomData } from "@/components/custom-fields/custom-field-inputs";

export interface CompanyFormValues {
  name: string;
  domain: string;
  industry: string;
  size_range: string;
  annual_revenue: string;
  description: string;
  custom_data: CustomData;
}

export const EMPTY_COMPANY: CompanyFormValues = {
  name: "",
  domain: "",
  industry: "",
  size_range: "",
  annual_revenue: "",
  description: "",
  custom_data: {},
};

export function CompanyForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial: CompanyFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState(initial);

  const set = (key: keyof CompanyFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: values.name.trim(),
          domain: values.domain.trim() || null,
          industry: values.industry.trim() || null,
          size_range: values.size_range.trim() || null,
          annual_revenue: values.annual_revenue.trim() === "" ? null : Number(values.annual_revenue),
          description: values.description.trim() || null,
          custom_data: values.custom_data,
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name" htmlFor="company-name" required>
          <input id="company-name" className="input" value={values.name} onChange={set("name")} required />
        </Field>
        <Field label="Domain" htmlFor="company-domain">
          <input
            id="company-domain"
            className="input"
            value={values.domain}
            onChange={set("domain")}
            placeholder="acme.com"
            autoComplete="off"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Industry" htmlFor="company-industry">
          <input id="company-industry" className="input" value={values.industry} onChange={set("industry")} />
        </Field>
        <Field label="Size range" htmlFor="company-size">
          <input
            id="company-size"
            className="input"
            value={values.size_range}
            onChange={set("size_range")}
            placeholder="11-50"
          />
        </Field>
      </div>
      <Field label="Annual revenue" htmlFor="company-revenue">
        <input
          id="company-revenue"
          type="number"
          min="0"
          step="1"
          className="input"
          value={values.annual_revenue}
          onChange={set("annual_revenue")}
        />
      </Field>
      <Field label="Description" htmlFor="company-description">
        <textarea
          id="company-description"
          className="input resize-y"
          rows={3}
          value={values.description}
          onChange={set("description")}
        />
      </Field>
      <CustomFieldInputs
        entityType="Company"
        values={values.custom_data}
        onChange={(custom_data) => setValues((v) => ({ ...v, custom_data }))}
      />
      <button type="submit" disabled={submitting || !values.name.trim()} className="btn-primary">
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
