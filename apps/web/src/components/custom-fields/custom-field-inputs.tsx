"use client";

import { Field } from "@/components/forms/fields";
import {
  useCustomFieldDefinitions,
  type CustomFieldDefinitionRecord,
} from "@/hooks/use-custom-fields";

export type CustomData = Record<string, unknown>;

function displayValue(def: CustomFieldDefinitionRecord, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (def.field_type === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (def.field_type === "currency" && typeof value === "number") return `$${value.toLocaleString()}`;
  if (def.field_type === "percentage" && typeof value === "number") return `${value}%`;
  return String(value);
}

function TypedInput({
  def,
  value,
  onChange,
}: {
  def: CustomFieldDefinitionRecord;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `cf-${def.key}`;
  const str = (value as string | null) ?? "";
  const choices = def.options?.choices ?? [];

  switch (def.field_type) {
    case "text_area":
      return (
        <textarea
          id={id}
          className="input resize-y"
          rows={2}
          value={String(str)}
          onChange={(e) => onChange(e.target.value)}
          required={!!def.required}
        />
      );
    case "number":
    case "currency":
    case "percentage":
      return (
        <input
          id={id}
          type="number"
          step="any"
          className="input"
          value={typeof value === "number" ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          required={!!def.required}
        />
      );
    case "boolean":
      return (
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case "date":
      return (
        <input
          id={id}
          type="date"
          className="input"
          value={typeof str === "string" ? str.slice(0, 10) : ""}
          onChange={(e) => onChange(e.target.value || null)}
          required={!!def.required}
        />
      );
    case "datetime":
      return (
        <input
          id={id}
          type="datetime-local"
          className="input"
          value={typeof str === "string" ? str.slice(0, 16) : ""}
          onChange={(e) => onChange(e.target.value || null)}
          required={!!def.required}
        />
      );
    case "select":
      return (
        <select
          id={id}
          className="input"
          value={String(str)}
          onChange={(e) => onChange(e.target.value || null)}
          required={!!def.required}
        >
          <option value="">Select…</option>
          {choices.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      );
    case "multi_select": {
      const selected = new Set(Array.isArray(value) ? (value as string[]) : []);
      return (
        <div className="flex flex-wrap gap-2">
          {choices.map((c) => (
            <label key={c} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={selected.has(c)}
                onChange={(e) => {
                  const next = new Set(selected);
                  if (e.target.checked) next.add(c);
                  else next.delete(c);
                  onChange(Array.from(next));
                }}
              />
              {c}
            </label>
          ))}
        </div>
      );
    }
    case "email":
      return (
        <input
          id={id}
          type="email"
          className="input"
          value={String(str)}
          onChange={(e) => onChange(e.target.value)}
          required={!!def.required}
        />
      );
    case "url":
      return (
        <input
          id={id}
          type="url"
          className="input"
          placeholder="https://…"
          value={String(str)}
          onChange={(e) => onChange(e.target.value)}
          required={!!def.required}
        />
      );
    case "phone":
      return (
        <input
          id={id}
          type="tel"
          className="input"
          value={String(str)}
          onChange={(e) => onChange(e.target.value)}
          required={!!def.required}
        />
      );
    default:
      return (
        <input
          id={id}
          className="input"
          value={String(str)}
          onChange={(e) => onChange(e.target.value)}
          required={!!def.required}
        />
      );
  }
}

export function CustomFieldInputs({
  entityType,
  values,
  onChange,
}: {
  entityType: string;
  values: CustomData;
  onChange: (values: CustomData) => void;
}) {
  const { data: definitions = [], isLoading } = useCustomFieldDefinitions(entityType);

  if (isLoading) return null;
  if (definitions.length === 0) return null;

  const set = (key: string) => (value: unknown) =>
    onChange({ ...values, [key]: value });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {definitions.map((def) => (
        <Field key={def.id} label={def.label} htmlFor={`cf-${def.key}`} required={!!def.required}>
          <TypedInput def={def} value={values[def.key]} onChange={set(def.key)} />
        </Field>
      ))}
    </div>
  );
}

export function CustomFieldValues({
  entityType,
  values,
}: {
  entityType: string;
  values: CustomData | null | undefined;
}) {
  const { data: definitions = [], isLoading } = useCustomFieldDefinitions(entityType);

  if (isLoading || definitions.length === 0) return null;
  const shown = definitions.filter(
    (d) => values && values[d.key] !== null && values[d.key] !== undefined && values[d.key] !== "",
  );
  if (shown.length === 0) return null;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-4">Custom Fields</h2>
      <dl className="space-y-3">
        {shown.map((def) => (
          <div key={def.id}>
            <dt className="text-sm text-[var(--text-secondary)]">{def.label}</dt>
            <dd className="mt-1">{displayValue(def, values?.[def.key])}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
