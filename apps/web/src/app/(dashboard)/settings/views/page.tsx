"use client";

import { useState } from "react";
import {
  useSavedViews,
  useUpdateSavedView,
  useDeleteSavedView,
} from "@/hooks/use-saved-views";
import { Field, FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { Pencil, Trash2, X } from "lucide-react";

export default function SavedViewsSettingsPage() {
  const { data: views = [], isLoading } = useSavedViews();
  const update = useUpdateSavedView();
  const remove = useDeleteSavedView();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [shared, setShared] = useState(false);

  const startEdit = (id: string, currentName: string, currentShared: boolean) => {
    setEditingId(id);
    setName(currentName);
    setShared(currentShared);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !name.trim()) return;
    setError(null);
    try {
      await update.mutateAsync({ id: editingId, name: name.trim(), shared });
      setEditingId(null);
    } catch (err) {
      setError(errMessage(err, "Could not save the view."));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Saved Views</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Reusable filters for lists — save them from any list page, manage them here
        </p>
      </div>

      <FormError message={error} />

      {editingId && (
        <form onSubmit={submitEdit} className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Rename View</h2>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="btn-ghost p-2"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name" htmlFor="sv-name" required>
              <input
                id="sv-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <label className="flex items-center gap-2 text-sm pt-6">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={shared}
                onChange={(e) => setShared(e.target.checked)}
              />
              Shared with the team
            </label>
          </div>
          <button type="submit" disabled={update.isPending} className="btn-primary">
            {update.isPending ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="table-cell table-header text-left">Name</th>
                <th className="table-cell table-header text-left">List</th>
                <th className="table-cell table-header text-left">Filters</th>
                <th className="table-cell table-header text-left">Shared</th>
                <th className="table-cell table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {views.map((v) => (
                <tr key={v.id} className="table-row">
                  <td className="table-cell font-medium">{v.name}</td>
                  <td className="table-cell text-[var(--text-secondary)] text-sm">{v.entity_type}</td>
                  <td className="table-cell text-[var(--text-secondary)] text-sm max-w-[16rem] truncate">
                    {Object.entries(v.filters ?? {})
                      .map(([k, val]) => `${k}=${val}`)
                      .join(", ") || "—"}
                  </td>
                  <td className="table-cell text-[var(--text-secondary)] text-sm">
                    {v.shared ? "Yes" : "No"}
                  </td>
                  <td className="table-cell">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => startEdit(v.id, v.name, v.shared)}
                        className="btn-ghost p-2"
                        aria-label={`Edit view ${v.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete view ${v.name}?`)) return;
                          setError(null);
                          try {
                            await remove.mutateAsync(v.id);
                          } catch (e) {
                            setError(errMessage(e, "Could not delete the view."));
                          }
                        }}
                        className="btn-ghost p-2"
                        aria-label={`Delete view ${v.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && views.length === 0 && (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
              No saved views yet — set filters on the contacts list and click Save view.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
