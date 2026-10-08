"use client";

import { Field } from "@/components/forms/fields";

export interface AddressValues {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export const EMPTY_ADDRESS: AddressValues = {
  street: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
};

export function normalizeAddress(value: unknown): AddressValues {
  const v = (value ?? {}) as Record<string, unknown>;
  return {
    street: String(v.street ?? ""),
    city: String(v.city ?? ""),
    state: String(v.state ?? ""),
    postal_code: String(v.postal_code ?? ""),
    country: String(v.country ?? ""),
  };
}

export function serializeAddress(value: AddressValues): Record<string, string> | null {
  const trimmed = Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, v.trim()]),
  ) as Record<string, string>;
  return Object.values(trimmed).some(Boolean) ? trimmed : null;
}

function addressLine(value: AddressValues): string {
  const cityLine = [value.city, value.state, value.postal_code].filter(Boolean).join(" ");
  return [value.street, cityLine, value.country].filter(Boolean).join(", ");
}

export function formatAddress(value: unknown): string {
  return addressLine(normalizeAddress(value)) || "—";
}

export function AddressFields({
  title,
  value,
  onChange,
  idPrefix,
  sameAs,
  sameAsLabel,
}: {
  title: string;
  value: AddressValues;
  onChange: (next: AddressValues) => void;
  idPrefix: string;
  sameAs?: AddressValues | null;
  sameAsLabel?: string;
}) {
  const set = (key: keyof AddressValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [key]: e.target.value });

  const copySameAs = () => {
    if (sameAs) onChange({ ...sameAs });
  };

  return (
    <fieldset className="rounded-[var(--radius-md)] border border-[var(--border)] p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <legend className="text-sm font-medium text-[var(--text-primary)] px-1">{title}</legend>
        {sameAs && sameAsLabel && (
          <button type="button" onClick={copySameAs} className="btn-secondary text-xs !px-2.5 !py-1">
            {sameAsLabel}
          </button>
        )}
      </div>
      <Field label="Street" htmlFor={`${idPrefix}-street`}>
        <input
          id={`${idPrefix}-street`}
          className="input"
          value={value.street}
          onChange={set("street")}
          autoComplete="street-address"
          placeholder="123 Main St"
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="City" htmlFor={`${idPrefix}-city`}>
          <input
            id={`${idPrefix}-city`}
            className="input"
            value={value.city}
            onChange={set("city")}
            autoComplete="address-level2"
          />
        </Field>
        <Field label="State / Province" htmlFor={`${idPrefix}-state`}>
          <input
            id={`${idPrefix}-state`}
            className="input"
            value={value.state}
            onChange={set("state")}
            autoComplete="address-level1"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Postal code" htmlFor={`${idPrefix}-postal`}>
          <input
            id={`${idPrefix}-postal`}
            className="input"
            value={value.postal_code}
            onChange={set("postal_code")}
            autoComplete="postal-code"
          />
        </Field>
        <Field label="Country" htmlFor={`${idPrefix}-country`}>
          <input
            id={`${idPrefix}-country`}
            className="input"
            value={value.country}
            onChange={set("country")}
            autoComplete="country-name"
          />
        </Field>
      </div>
    </fieldset>
  );
}
