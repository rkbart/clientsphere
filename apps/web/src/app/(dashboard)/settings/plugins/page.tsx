"use client";

import { useState } from "react";
import {
  usePlugins,
  useCreatePlugin,
  useUpdatePlugin,
  useDeletePlugin,
  type PluginRecord,
} from "@/hooks/use-plugins";
import { Field, FormError } from "@/components/forms/fields";
import { ActionBanner, useActionNotice } from "@/components/shared/action-banner";
import { ConfirmDialog, ResultModal } from "@/components/ui/modal";
import { errMessage } from "@/lib/error";
import { Pencil, Plus, Trash2, X, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useCanManageSettings } from "@/hooks/use-current-role";
import { ManagerOnlyNotice } from "@/components/settings/manager-only-notice";

const TRIGGER_OPTIONS = [
  "contact_created",
  "contact_updated",
  "deal_created",
  "deal_stage_changed",
  "deal_won",
  "deal_lost",
  "activity_completed",
  "activity_overdue",
];

interface PluginFormState {
  name: string;
  description: string;
  webhook_url: string;
  triggers: string[];
  is_active: boolean;
}

const EMPTY_FORM: PluginFormState = {
  name: "",
  description: "",
  webhook_url: "",
  triggers: [],
  is_active: true,
};

export default function PluginsSettingsPage() {
  const { data: plugins = [], isLoading } = usePlugins();
  const create = useCreatePlugin();
  const update = useUpdatePlugin();
  const remove = useDeletePlugin();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<(typeof plugins)[number] | null>(null);
  const [pluginResult, setPluginResult] = useState<string | null>(null);
  const { notice, notify, dismiss } = useActionNotice();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PluginFormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const canManage = useCanManageSettings();

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const startEdit = (plugin: PluginRecord) => {
    setEditingId(plugin.id);
    setForm({
      name: plugin.name,
      description: plugin.description ?? "",
      webhook_url: plugin.webhook_url ?? "",
      triggers: plugin.triggers ?? [],
      is_active: plugin.is_active,
    });
    setShowForm(true);
  };

  const toggleTrigger = (trigger: string) =>
    setForm((f) => ({
      ...f,
      triggers: f.triggers.includes(trigger)
        ? f.triggers.filter((t) => t !== trigger)
        : [...f.triggers, trigger],
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      webhook_url: form.webhook_url.trim() || null,
      triggers: form.triggers,
      is_active: form.is_active,
    };
    const label = form.name.trim();
    const wasEditing = editingId;
    try {
      if (editingId) await update.mutateAsync({ id: editingId, ...payload });
      else await create.mutateAsync(payload);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      setPluginResult(wasEditing ? `Plugin “${label}” updated.` : `Plugin “${label}” created.`);
    } catch (err) {
      setError(errMessage(err, "Could not save the plugin."));
    }
  };

  if (!canManage) return <ManagerOnlyNotice title="Plugins" />;

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
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Plugins</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Webhook plugins that fire on CRM events
          </p>
        </div>
        <button onClick={startCreate} className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          New Plugin
        </button>
      </div>

      <FormError message={error} />

      {showForm && (
        <form onSubmit={submit} className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editingId ? "Edit Plugin" : "New Plugin"}</h2>
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
            <Field label="Name" htmlFor="plugin-name" required>
              <input
                id="plugin-name"
                className="input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Deal alerts"
                required
              />
            </Field>
            <Field label="Webhook URL" htmlFor="plugin-url">
              <input
                id="plugin-url"
                type="url"
                className="input"
                value={form.webhook_url}
                onChange={(e) => setForm((f) => ({ ...f, webhook_url: e.target.value }))}
                placeholder="https://hooks.slack.com/… or Make/n8n webhook URL"
              />
            </Field>
          </div>
          <Field label="Description" htmlFor="plugin-description">
            <input
              id="plugin-description"
              className="input"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What does this plugin do?"
            />
          </Field>
          <div>
            <p className="text-sm font-medium mb-2">Trigger events</p>
            <div className="flex flex-wrap gap-2">
              {TRIGGER_OPTIONS.map((trigger) => (
                <label
                  key={trigger}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-[var(--radius-md)] border cursor-pointer ${
                    form.triggers.includes(trigger)
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={form.triggers.includes(trigger)}
                    onChange={() => toggleTrigger(trigger)}
                  />
                  {trigger.replace(/_/g, " ")}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Active
          </label>
          <button
            type="submit"
            disabled={create.isPending || update.isPending || !form.name.trim()}
            className="btn-primary"
          >
            {create.isPending || update.isPending ? "Saving…" : editingId ? "Save changes" : "Create plugin"}
          </button>
        </form>
      )}

      {notice && <ActionBanner notice={notice} onDismiss={dismiss} />}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="table-cell table-header text-left">Name</th>
                <th className="table-cell table-header text-left">Triggers</th>
                <th className="table-cell table-header text-left">Status</th>
                <th className="table-cell table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {plugins.map((plugin) => (
                <tr key={plugin.id} className="table-row">
                  <td className="table-cell font-medium">{plugin.name}</td>
                  <td className="table-cell text-[var(--text-secondary)] text-sm">
                    {plugin.triggers.join(", ") || "—"}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${plugin.is_active ? "badge-success" : "badge-neutral"}`}>
                      {plugin.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => startEdit(plugin)}
                        className="btn-ghost p-2"
                        aria-label={`Edit ${plugin.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(plugin)}
                        className="btn-ghost p-2"
                        aria-label={`Delete ${plugin.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && plugins.length === 0 && (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
              No plugins yet — create one to react to CRM events.
            </p>
          )}
        </div>
      </div>

      <ResultModal
        open={!!pluginResult}
        onClose={() => setPluginResult(null)}
        tone="success"
        title="Plugin saved"
        message={pluginResult ?? ""}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          const label = confirmDelete.name;
          setError(null);
          setConfirmDelete(null);
          remove.mutate(confirmDelete.id, {
            onSuccess: () => notify({ tone: "success", message: `Plugin “${label}” deleted.` }),
            onError: (e) => setError(errMessage(e, "Could not delete the plugin.")),
          });
        }}
        title="Delete plugin?"
        message={`“${confirmDelete?.name ?? ""}” will stop receiving CRM events. This action cannot be undone.`}
        confirming={remove.isPending}
      />
    </div>
  );
}
