"use client";

import { useState } from "react";
import {
  useCustomObjectDefinitions,
  useCreateCustomObjectDefinition,
  useUpdateCustomObjectDefinition,
  useDeleteCustomObjectDefinition,
  type CustomObjectDefinitionRecord,
} from "@/hooks/use-custom-objects";
import { Field, FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft, Lock, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCanManageSettings } from "@/hooks/use-current-role";
import Link from "next/link";

const FIELD_TYPES = ["text", "number", "boolean", "date", "select"];

interface DefinitionFormState {
  name: string;
  icon: string;
  fields: { name: string; type: string; required: boolean }[];
}

const EMPTY_FORM: DefinitionFormState = {
  name: "",
  icon: "📦",
  fields: [],
};

export default function CustomObjectsSettingsPage() {
  const { data: definitions = [], isLoading } = useCustomObjectDefinitions();
  const create = useCreateCustomObjectDefinition();
  const update = useUpdateCustomObjectDefinition();
  const remove = useDeleteCustomObjectDefinition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DefinitionFormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const canManage = useCanManageSettings();

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const startEdit = (def: CustomObjectDefinitionRecord) => {
    setEditingId(def.id);
    setForm({
      name: def.name,
      icon: def.icon,
      fields: def.fields.map((f) => ({ name: f.name, type: f.type, required: !!f.required })),
    });
    setShowForm(true);
  };

  const addField = () =>
    setForm((f) => ({ ...f, fields: [...f.fields, { name: "", type: "text", required: false }] }));

  const updateField = (index: number, key: string, value: string | boolean) =>
    setForm((f) => ({
      ...f,
      fields: f.fields.map((field, i) => (i === index ? { ...field, [key]: value } : field)),
    }));

  const removeField = (index: number) =>
    setForm((f) => ({ ...f, fields: f.fields.filter((_, i) => i !== index) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name.trim(),
      icon: form.icon,
      fields: form.fields.filter((f) => f.name.trim()),
    };
    try {
      if (editingId) await update.mutateAsync({ id: editingId, ...payload });
      else await create.mutateAsync(payload);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      setError(errMessage(err, "Could not save the object."));
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
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Custom Objects</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Define your own record types with custom fields
          </p>
        </div>
        {canManage && (
          <button onClick={startCreate} className="btn-primary self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            New Object
          </button>
        )}
      </div>

      {!canManage && (
        <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Lock className="h-3.5 w-3.5" />
          You can view these objects, but only owners and admins can add or change them.
        </p>
      )}

      <FormError message={error} />

      {showForm && (
        <form onSubmit={submit} className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editingId ? "Edit Object" : "New Object"}</h2>
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
            <Field label="Name" htmlFor="co-name" required>
              <input
                id="co-name"
                className="input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Projects"
                required
              />
            </Field>
            <Field label="Icon (emoji)" htmlFor="co-icon">
              <input
                id="co-icon"
                className="input"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="📦"
              />
            </Field>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Fields</p>
              <button type="button" onClick={addField} className="btn-ghost text-sm">
                <Plus className="h-4 w-4" />
                Add field
              </button>
            </div>
            {form.fields.map((field, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  className="input col-span-4"
                  value={field.name}
                  onChange={(e) => updateField(i, "name", e.target.value)}
                  placeholder="Field name"
                  aria-label={`Field ${i + 1} name`}
                />
                <select
                  className="input col-span-3"
                  value={field.type}
                  onChange={(e) => updateField(i, "type", e.target.value)}
                  aria-label={`Field ${i + 1} type`}
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5 text-sm col-span-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={field.required}
                    onChange={(e) => updateField(i, "required", e.target.checked)}
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => removeField(i)}
                  className="btn-ghost p-2 col-span-2"
                  aria-label={`Remove field ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {form.fields.length === 0 && (
              <p className="text-sm text-[var(--text-tertiary)]">No fields yet.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={create.isPending || update.isPending || !form.name.trim()}
            className="btn-primary"
          >
            {create.isPending || update.isPending ? "Saving…" : editingId ? "Save changes" : "Create object"}
          </button>
        </form>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="table-cell table-header text-left">Icon</th>
                <th className="table-cell table-header text-left">Name</th>
                <th className="table-cell table-header text-left">Fields</th>
                {canManage && <th className="table-cell table-header text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {definitions.map((d) => (
                <tr key={d.id} className="table-row">
                  <td className="table-cell text-lg">{d.icon}</td>
                  <td className="table-cell font-medium">{d.name}</td>
                  <td className="table-cell text-[var(--text-secondary)] text-sm">
                    {d.fields.map((f) => f.name).join(", ") || "—"}
                  </td>
                  <td className="table-cell">
                    <div className="flex justify-end gap-1">
                      {canManage && (
                          <>
                        <button
                          onClick={() => startEdit(d)}
                          className="btn-ghost p-2"
                          aria-label={`Edit ${d.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete ${d.name}? All records will be lost.`)) return;
                            setError(null);
                            try {
                              await remove.mutateAsync(d.id);
                            } catch (e) {
                              setError(errMessage(e, "Could not delete the object."));
                            }
                          }}
                          className="btn-ghost p-2"
                          aria-label={`Delete ${d.name}`}
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
              No custom objects yet — create one to track anything.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
