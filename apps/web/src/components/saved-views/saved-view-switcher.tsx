"use client";

import { useState } from "react";
import { useSavedViews, useCreateSavedView, type SavedViewRecord } from "@/hooks/use-saved-views";
import { errMessage } from "@/lib/ai/error";
import { BookmarkPlus, X } from "lucide-react";

export type ViewFilters = Record<string, string>;

export function SavedViewSwitcher({
  entityType,
  currentFilters,
  onApply,
}: {
  entityType: string;
  currentFilters: ViewFilters;
  onApply: (filters: ViewFilters) => void;
}) {
  const { data: views = [] } = useSavedViews(entityType);
  const create = useCreateSavedView();
  const [activeId, setActiveId] = useState("");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [shared, setShared] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = (id: string) => {
    setActiveId(id);
    if (!id) {
      onApply({});
      return;
    }
    const view = views.find((v) => v.id === id);
    if (view) onApply({ ...(view.filters ?? {}) });
  };

  const saveCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      const created = (await create.mutateAsync({
        entity_type: entityType,
        name: name.trim(),
        filters: currentFilters,
        sort: {},
        columns: {},
        shared,
      })) as unknown as SavedViewRecord;
      setName("");
      setShared(false);
      setSaving(false);
      setActiveId(created.id);
    } catch (err) {
      setError(errMessage(err, "Could not save the view."));
    }
  };

  const hasFilters = Object.values(currentFilters).some(Boolean);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <select
          value={activeId}
          onChange={(e) => apply(e.target.value)}
          className="input w-auto min-w-[10rem]"
          aria-label="Saved view"
        >
          <option value="">All records</option>
          {views.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
              {v.shared ? " (shared)" : ""}
            </option>
          ))}
        </select>
        {activeId && (
          <button
            onClick={() => apply("")}
            className="btn-ghost p-2"
            aria-label="Clear saved view"
            title="Clear saved view"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {hasFilters && !saving && (
          <button
            onClick={() => setSaving(true)}
            className="btn-ghost text-sm border border-[var(--border)]"
          >
            <BookmarkPlus className="h-4 w-4" />
            Save view
          </button>
        )}
      </div>
      {saving && (
        <form onSubmit={saveCurrent} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <input
            className="input max-w-xs"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="View name, e.g. Hot leads"
            aria-label="View name"
          />
          <label className="flex items-center gap-1.5 text-sm whitespace-nowrap">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
            />
            Shared
          </label>
          <button type="submit" disabled={create.isPending || !name.trim()} className="btn-primary text-sm">
            {create.isPending ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => setSaving(false)} className="btn-ghost text-sm">
            Cancel
          </button>
        </form>
      )}
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}
