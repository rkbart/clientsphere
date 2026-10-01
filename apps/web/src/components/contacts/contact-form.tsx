"use client";

import { useState } from "react";
import { Field } from "@/components/forms/fields";
import { CustomFieldInputs, type CustomData } from "@/components/custom-fields/custom-field-inputs";
import { useCompanies } from "@/hooks/use-companies";
import { SocialLinksEditor, type SocialLink } from "@/components/shared/social-links-editor";

export interface ContactFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  company_id: string;
  job_title: string;
  city: string;
  social_links: SocialLink[];
  custom_data: CustomData;
}

export const EMPTY_CONTACT: ContactFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  status: "lead",
  company_id: "",
  job_title: "",
  city: "",
  social_links: [],
  custom_data: {},
};

export function ContactForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial: ContactFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState(initial);
  const { data: companiesRes } = useCompanies({ per_page: 100 });
  const companies = ((companiesRes as unknown as { data?: { id: string; name: string }[] })?.data ?? []);

  const set = (key: keyof ContactFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim() || null,
          email: values.email.trim() || null,
          phone: values.phone.trim() || null,
          status: values.status,
          company_id: values.company_id || null,
          job_title: values.job_title.trim() || null,
          city: values.city.trim() || null,
          social_links: values.social_links
            .map((l) => ({ platform: l.platform, url: l.url.trim() }))
            .filter((l) => l.url !== ""),
          custom_data: values.custom_data,
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name" htmlFor="contact-first-name" required>
          <input
            id="contact-first-name"
            className="input"
            value={values.first_name}
            onChange={set("first_name")}
            autoComplete="given-name"
            required
          />
        </Field>
        <Field label="Last name" htmlFor="contact-last-name">
          <input
            id="contact-last-name"
            className="input"
            value={values.last_name}
            onChange={set("last_name")}
            autoComplete="family-name"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email" htmlFor="contact-email">
          <input
            id="contact-email"
            type="email"
            className="input"
            value={values.email}
            onChange={set("email")}
            autoComplete="email"
          />
        </Field>
        <Field label="Phone" htmlFor="contact-phone">
          <input
            id="contact-phone"
            type="tel"
            className="input"
            value={values.phone}
            onChange={set("phone")}
            autoComplete="tel"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Status" htmlFor="contact-status">
          <select id="contact-status" className="input" value={values.status} onChange={set("status")}>
            <option value="lead">Lead</option>
            <option value="customer">Customer</option>
            <option value="churned">Churned</option>
          </select>
        </Field>
        <Field label="Company" htmlFor="contact-company">
          <select id="contact-company" className="input" value={values.company_id} onChange={set("company_id")}>
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
        <Field label="Job title" htmlFor="contact-job-title">
          <input
            id="contact-job-title"
            className="input"
            value={values.job_title}
            onChange={set("job_title")}
            autoComplete="organization-title"
          />
        </Field>
        <Field label="City" htmlFor="contact-city">
          <input
            id="contact-city"
            className="input"
            value={values.city}
            onChange={set("city")}
            autoComplete="address-level2"
          />
        </Field>
      </div>
      <SocialLinksEditor
        value={values.social_links}
        onChange={(social_links) => setValues((v) => ({ ...v, social_links }))}
      />
      <CustomFieldInputs
        entityType="Contact"
        values={values.custom_data}
        onChange={(custom_data) => setValues((v) => ({ ...v, custom_data }))}
      />
      <button type="submit" disabled={submitting || !values.first_name.trim()} className="btn-primary">
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
