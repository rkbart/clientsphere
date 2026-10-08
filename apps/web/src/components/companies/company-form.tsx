"use client";

import { useState } from "react";
import { Field } from "@/components/forms/fields";
import { CustomFieldInputs, type CustomData } from "@/components/custom-fields/custom-field-inputs";
import { SocialLinksEditor, type SocialLink } from "@/components/shared/social-links-editor";
import {
  AddressFields,
  EMPTY_ADDRESS,
  serializeAddress,
  type AddressValues,
} from "@/components/shared/address-fields";
import { useContacts } from "@/hooks/use-contacts";

export interface CompanyFormValues {
  name: string;
  domain: string;
  industry: string;
  size_range: string;
  annual_revenue: string;
  description: string;
  address: string;
  billing_address: AddressValues;
  shipping_address: AddressValues;
  main_contact_id: string;
  social_links: SocialLink[];
  custom_data: CustomData;
}

export const EMPTY_COMPANY: CompanyFormValues = {
  name: "",
  domain: "",
  industry: "",
  size_range: "",
  annual_revenue: "",
  description: "",
  address: "",
  billing_address: { ...EMPTY_ADDRESS },
  shipping_address: { ...EMPTY_ADDRESS },
  main_contact_id: "",
  social_links: [],
  custom_data: {},
};

export function CompanyForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
  companyId,
}: {
  initial: CompanyFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: Record<string, unknown>) => void;
  companyId?: string;
}) {
  const [values, setValues] = useState(initial);
  const { data: contactsRes } = useContacts({ per_page: 100 });
  const allContacts = (
    (contactsRes as unknown as { data?: { id: string; first_name: string; last_name?: string | null; company?: { id: string } | null }[] })?.data ?? []
  );
  const contacts = companyId ? allContacts.filter((c) => c.company?.id === companyId) : [];

  const set = (key: keyof CompanyFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
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
          address: values.address.trim() || null,
          billing_address: serializeAddress(values.billing_address),
          shipping_address: serializeAddress(values.shipping_address),
          main_contact_id: values.main_contact_id || null,
          social_links: values.social_links
            .map((l) => ({ platform: l.platform, url: l.url.trim() }))
            .filter((l) => l.url !== ""),
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
      <Field label="Address" htmlFor="company-address">
        <input id="company-address" className="input" value={values.address} onChange={set("address")} />
      </Field>
      <AddressFields
        title="Billing address"
        idPrefix="company-billing"
        value={values.billing_address}
        onChange={(billing_address) => setValues((v) => ({ ...v, billing_address }))}
      />
      <AddressFields
        title="Shipping address"
        idPrefix="company-shipping"
        value={values.shipping_address}
        onChange={(shipping_address) => setValues((v) => ({ ...v, shipping_address }))}
        sameAs={values.billing_address}
        sameAsLabel="Same as billing"
      />
      {companyId && (
        <Field label="Main contact" htmlFor="company-main-contact">
          <select
            id="company-main-contact"
            className="input"
            value={values.main_contact_id}
            onChange={set("main_contact_id")}
          >
            <option value="">No main contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name ?? ""}
              </option>
            ))}
          </select>
        </Field>
      )}
      <SocialLinksEditor
        value={values.social_links}
        onChange={(social_links) => setValues((v) => ({ ...v, social_links }))}
      />
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
