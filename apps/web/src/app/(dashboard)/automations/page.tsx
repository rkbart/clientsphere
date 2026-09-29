"use client";

import Link from "next/link";
import { useAutomations, useToggleAutomation, useDeleteAutomation } from "@/hooks/use-automations";
import { errMessage } from "@/lib/ai/error";
import { Plus, Pencil, Trash2, Play, Pause } from "lucide-react";
import { useState } from "react";

interface Automation {
  id: string;
  name: string;
  trigger_type: string;
  is_active: boolean;
}

export default function AutomationsPage() {
  const { data, isLoading } = useAutomations();
  const toggle = useToggleAutomation();
  const remove = useDeleteAutomation();
  const [error, setError] = useState<string | null>(null);
  const list = ((data as unknown as { data?: Automation[] })?.data ?? []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Automations</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            When something happens, do something — automatically
          </p>
        </div>
        <Link href="/automations/new" className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          New Automation
        </Link>
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="table-cell table-header text-left">Name</th>
                <th className="table-cell table-header text-left">Trigger</th>
                <th className="table-cell table-header text-left">Status</th>
                <th className="table-cell table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {list.map((a) => (
                <tr key={a.id} className="table-row">
                  <td className="table-cell font-medium">
                    <Link href={`/automations/${a.id}/edit`} className="hover:text-[var(--text-secondary)] transition-colors">
                      {a.name}
                    </Link>
                  </td>
                  <td className="table-cell text-[var(--text-secondary)]">{a.trigger_type.replace(/_/g, " ")}</td>
                  <td className="table-cell">
                    <span className={`badge ${a.is_active ? "badge-success" : "badge-neutral"}`}>
                      {a.is_active ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={async () => {
                          setError(null);
                          try {
                            await toggle.mutateAsync(a.id);
                          } catch (e) {
                            setError(errMessage(e, "Could not toggle the automation."));
                          }
                        }}
                        className="btn-ghost p-2"
                        aria-label={a.is_active ? `Pause ${a.name}` : `Activate ${a.name}`}
                        title={a.is_active ? "Pause" : "Activate"}
                      >
                        {a.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <Link href={`/automations/${a.id}/edit`} className="btn-ghost p-2" aria-label={`Edit ${a.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete automation "${a.name}"?`)) return;
                          setError(null);
                          try {
                            await remove.mutateAsync(a.id);
                          } catch (e) {
                            setError(errMessage(e, "Could not delete the automation."));
                          }
                        }}
                        className="btn-ghost p-2"
                        aria-label={`Delete ${a.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && list.length === 0 && (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
              No automations yet — create one to react to CRM events.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
