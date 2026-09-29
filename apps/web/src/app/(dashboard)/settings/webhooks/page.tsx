"use client";

import Link from "next/link";
import { useWebhooks, useDeleteWebhook } from "@/hooks/use-webhooks";
import { errMessage } from "@/lib/ai/error";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
}

export default function WebhooksSettingsPage() {
  const { data, isLoading } = useWebhooks();
  const remove = useDeleteWebhook();
  const [error, setError] = useState<string | null>(null);
  const list = ((data as unknown as { data?: Webhook[] })?.data ?? []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Webhooks</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Signed POST deliveries with retries and a delivery log
          </p>
        </div>
        <Link href="/settings/webhooks/new" className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          New Webhook
        </Link>
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="table-cell table-header text-left">URL</th>
                <th className="table-cell table-header text-left">Events</th>
                <th className="table-cell table-header text-left">Status</th>
                <th className="table-cell table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {list.map((w) => (
                <tr key={w.id} className="table-row">
                  <td className="table-cell font-medium max-w-[16rem] truncate">
                    <Link href={`/settings/webhooks/${w.id}`} className="hover:text-[var(--text-secondary)] transition-colors">
                      {w.url}
                    </Link>
                  </td>
                  <td className="table-cell text-[var(--text-secondary)] text-sm max-w-[14rem] truncate">
                    {(w.events ?? []).join(", ") || "—"}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${w.is_active ? "badge-success" : "badge-neutral"}`}>
                      {w.is_active ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex justify-end">
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete webhook ${w.url}?`)) return;
                          setError(null);
                          try {
                            await remove.mutateAsync(w.id);
                          } catch (e) {
                            setError(errMessage(e, "Could not delete the webhook."));
                          }
                        }}
                        className="btn-ghost p-2"
                        aria-label={`Delete webhook ${w.url}`}
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
              No webhooks yet — automations can call them via the call-webhook action.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
