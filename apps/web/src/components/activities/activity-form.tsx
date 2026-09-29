"use client";

import { useState } from "react";
import { Field } from "@/components/forms/fields";
import { ACTIVITY_KINDS } from "@/hooks/use-activities";
import { useContacts } from "@/hooks/use-contacts";
import { useCompanies } from "@/hooks/use-companies";
import { useDeals } from "@/hooks/use-deals";

export interface ActivityFormValues {
  kind: string;
  subject: string;
  description: string;
  contact_id: string;
  company_id: string;
  deal_id: string;
  due_at: string;
}

export const EMPTY_ACTIVITY: ActivityFormValues = {
  kind: "task",
  subject: "",
  description: "",
  contact_id: "",
  company_id: "",
  deal_id: "",
  due_at: "",
};

export function ActivityForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial: ActivityFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState(initial);
  const { data: contactsRes } = useContacts({ per_page: 100 });
  const { data: companiesRes } = useCompanies({ per_page: 100 });
  const { data: dealsRes } = useDeals({ per_page: 100 });

  const contacts = ((contactsRes as unknown as { data?: { id: string; first_name: string; last_name: string }[] })?.data ?? []);
  const companies = ((companiesRes as unknown as { data?: { id: string; name: string }[] })?.data ?? []);
  const deals = ((dealsRes as unknown as { data?: { id: string; title: string }[] })?.data ?? []);

  const set = (key: keyof ActivityFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          kind: values.kind,
          subject: values.subject.trim(),
          description: values.description.trim() || null,
          contact_id: values.contact_id || null,
          company_id: values.company_id || null,
          deal_id: values.deal_id || null,
          due_at: values.due_at || null,
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Type" htmlFor="activity-kind">
          <select id="activity-kind" className="input capitalize" value={values.kind} onChange={set("kind")}>
            {ACTIVITY_KINDS.map((k) => (
              <option key={k} value={k} className="capitalize">
                {k}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Due date" htmlFor="activity-due">
          <input id="activity-due" type="date" className="input" value={values.due_at} onChange={set("due_at")} />
        </Field>
      </div>
      <Field label="Subject" htmlFor="activity-subject" required>
        <input id="activity-subject" className="input" value={values.subject} onChange={set("subject")} required />
      </Field>
      <Field label="Description" htmlFor="activity-description">
        <textarea
          id="activity-description"
          className="input resize-y"
          rows={3}
          value={values.description}
          onChange={set("description")}
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Contact" htmlFor="activity-contact">
          <select id="activity-contact" className="input" value={values.contact_id} onChange={set("contact_id")}>
            <option value="">None</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Company" htmlFor="activity-company">
          <select id="activity-company" className="input" value={values.company_id} onChange={set("company_id")}>
            <option value="">None</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Deal" htmlFor="activity-deal">
          <select id="activity-deal" className="input" value={values.deal_id} onChange={set("deal_id")}>
            <option value="">None</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <button type="submit" disabled={submitting || !values.subject.trim()} className="btn-primary">
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
