"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  useCustomFieldDefinitions,
  useCreateCustomFieldDefinition,
  useUpdateCustomFieldDefinition,
  useDeleteCustomFieldDefinition,
  type CustomFieldDefinitionRecord,
} from "@/hooks/use-custom-fields";
import { Field, FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft, Lock, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCanManageSettings } from "@/hooks/use-current-role";

const ENTITY_TYPES = [
  { value: "Contact", label: "Contacts" },
  { value: "Company", label: "Companies" },
  { value: "Deal", label: "Deals" },
];
const FIELD_TYPES = [
  "text",
  "text_area",
  "number",
  "currency",
  "percentage",
  "boolean",
  "date",
  "datetime",
  "email",
  "phone",
  "url",
  "select",
  "multi_select",
];
const CHOICE_TYPES = new Set(["select", "multi_select"]);

interface DefinitionFormState {
  entity_type: string;
  key: string;
  label: string;
  field_type: string;
  choices: string;
  required: boolean;
  position: string;
}

const EMPTY_FORM: DefinitionFormState = {
  entity_type: "Contact",
  key: "",
  label: "",
  field_type: "text",
  choices: "",
  required: false,
  position: "",
};

function toForm(def: CustomFieldDefinitionRecord): DefinitionFormState {
  return {
    entity_type: def.entity_type,
    key: def.key,
    label: def.label,
    field_type: def.field_type,
    choices: (def.options?.choices ?? []).join(", "),
    required: !!def.required,
    position: def.position == null ? "" : String(def.position),
  };
}

export default function CustomFieldsSettingsPage() {
  const [tab, setTab] = useState("Contact");
  const { data: allDefinitions = [], isLoading } = useCustomFieldDefinitions();
  const definitions = useMemo(
    () => allDefinitions.filter((d) => d.entity_type === tab),
    [allDefinitions, tab]
  );
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of allDefinitions) map[d.entity_type] = (map[d.entity_type] ?? 0) + 1;
    return map;
  }, [allDefinitions]);
  const tabLabel = ENTITY_TYPES.find((t) => t.value === tab)?.label ?? tab;
  const canManage = useCanManageSettings();
  const create = useCreateCustomFieldDefinition();
  const update = useUpdateCustomFieldDefinition();
  const remove = useDeleteCustomFieldDefinition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DefinitionFormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const saving = create.isPending || update.isPending;

  const startCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, entity_type: tab });
    setShowForm(true);
  };

  const startEdit = (def: CustomFieldDefinitionRecord) => {
    setEditingId(def.id);
    setForm(toForm(def));
    setShowForm(true);
  };

  const set =
    (key: keyof DefinitionFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload: Record<string, unknown> = {
      entity_type: form.entity_type,
      key: form.key.trim(),
      label: form.label.trim(),
      field_type: form.field_type,
      required: form.required,
      position: form.position.trim() === "" ? null : Number(form.position),
    };
    if (CHOICE_TYPES.has(form.field_type)) {
      payload.options = {
        choices: form.choices
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      };
    }
    try {
      if (editingId) await update.mutateAsync({ id: editingId, ...payload });
      else await create.mutateAsync(payload);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      setError(errMessage(err, "Could not save the field."));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/settings"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to settings
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Custom Fields</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Extra typed fields on records, stored per account
          </p>
        </div>
        {canManage && (
          <button onClick={startCreate} className="btn-primary self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            New Field
          </button>
        )}
      </div>
      {!canManage && (
        <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Lock className="h-3.5 w-3.5" />
          You can view these fields, but only owners and admins can add or change them.
        </p>
      )}


      <div className="flex gap-2" role="tablist" aria-label="Entity types">
        {ENTITY_TYPES.map((t) => {
          const selected = tab === t.value;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(t.value)}
              className={`btn-ghost text-sm border px-3.5 py-1.5 ${
                selected
                  ? "!bg-[var(--accent)] !text-[var(--text-inverse)] !border-transparent font-medium"
                  : "!border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:!bg-[var(--accent-soft)]"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-xs ${selected ? "opacity-80" : "text-[var(--text-tertiary)]"}`}>
                {counts[t.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <FormError message={error} />

      {showForm && (
        <form onSubmit={submit} className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editingId ? "Edit Field" : "New Field"}</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-ghost p-2"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Applies to" htmlFor="cf-entity">
              <select id="cf-entity" className="input" value={form.entity_type} onChange={set("entity_type")}>
                {ENTITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type" htmlFor="cf-type">
              <select id="cf-type" className="input" value={form.field_type} onChange={set("field_type")}>
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Label" htmlFor="cf-label" required>
              <input
                id="cf-label"
                className="input"
                value={form.label}
                onChange={set("label")}
                placeholder="Plan"
                required
              />
            </Field>
            <Field label="Key (snake_case)" htmlFor="cf-key" required>
              <input
                id="cf-key"
                className="input"
                value={form.key}
                onChange={set("key")}
                placeholder="plan"
                required
              />
            </Field>
          </div>
          {CHOICE_TYPES.has(form.field_type) && (
            <Field label="Choices (comma-separated)" htmlFor="cf-choices" required>
              <input
                id="cf-choices"
                className="input"
                value={form.choices}
                onChange={set("choices")}
                placeholder="free, pro, enterprise"
                required
              />
            </Field>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Position" htmlFor="cf-position">
              <input
                id="cf-position"
                type="number"
                min="0"
                step="1"
                className="input"
                value={form.position}
                onChange={set("position")}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm pt-6">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.required}
                onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
              />
              Required
            </label>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : editingId ? "Save changes" : "Create field"}
          </button>
        </form>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-sm font-semibold">Existing fields — {tabLabel}</h2>
          <span className="text-xs text-[var(--text-tertiary)]">
            {definitions.length} {definitions.length === 1 ? "field" : "fields"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="table-cell table-header text-left">Label</th>
                <th className="table-cell table-header text-left">Key</th>
                <th className="table-cell table-header text-left">Type</th>
                <th className="table-cell table-header text-left">Required</th>
                {canManage && <th className="table-cell table-header text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {definitions.map((d) => (
                <tr key={d.id} className="table-row">
                  <td className="table-cell font-medium">{d.label}</td>
                  <td className="table-cell text-[var(--text-secondary)] text-sm font-mono">{d.key}</td>
                  <td className="table-cell text-[var(--text-secondary)] text-sm">{d.field_type}</td>
                  <td className="table-cell text-[var(--text-secondary)] text-sm">
                    {d.required ? "Yes" : "No"}
                  </td>
                  <td className="table-cell">
                    <div className="flex justify-end gap-1">
                      {canManage && (
                          <>
                        <button
                          onClick={() => startEdit(d)}
                          className="btn-ghost p-2"
                          aria-label={`Edit field ${d.label}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete field ${d.label}? Existing values stay on records.`)) return;
                            setError(null);
                            try {
                              await remove.mutateAsync(d.id);
                            } catch (e) {
                              setError(errMessage(e, "Could not delete the field."));
                            }
                          }}
                          className="btn-ghost p-2"
                          aria-label={`Delete field ${d.label}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && definitions.length === 0 && (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
              No {tab.toLowerCase()} fields yet — create one to start capturing extra data.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
