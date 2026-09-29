"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, FormError } from "@/components/forms/fields";
import { useWebhook, useUpdateWebhook, useWebhookDeliveries } from "@/hooks/use-webhooks";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft } from "lucide-react";

interface Delivery {
  id: string;
  event: string;
  status: string;
  response_status?: number | null;
  attempts?: number;
  delivered_at?: string | null;
  created_at: string;
}

const DELIVERY_BADGE: Record<string, string> = {
  success: "badge-success",
  failed: "badge-danger",
  pending: "badge-neutral",
  retrying: "badge-warning",
};

export default function WebhookDetailPage({ params }: { params: { id: string } }) {
  const { data: webhook, isLoading } = useWebhook(params.id);
  const { data: deliveriesRes } = useWebhookDeliveries(params.id);
  const update = useUpdateWebhook();
  const [error, setError] = useState<string | null>(null);

  const w = webhook as unknown as { url?: string; events?: string[]; is_active?: boolean } | undefined;
  const [url, setUrl] = useState<string | null>(null);
  const [events, setEvents] = useState<string | null>(null);
  const deliveries = ((deliveriesRes as unknown as { data?: Delivery[] })?.data ?? []);

  const shownUrl = url ?? w?.url ?? "";
  const shownEvents = events ?? (w?.events ?? []).join(", ");

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <Link
          href="/settings/webhooks"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to webhooks
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Webhook</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-mono break-all">{w?.url}</p>
      </div>

      <div className="card p-6 space-y-4">
        {isLoading ? (
          <div className="h-48 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] animate-pulse" />
        ) : !w ? (
          <p className="text-sm text-[var(--text-tertiary)]">Webhook not found</p>
        ) : (
          <>
            <FormError message={error} />
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                try {
                  await update.mutateAsync({
                    id: params.id,
                    url: shownUrl.trim(),
                    events: shownEvents.split(",").map((s) => s.trim()).filter(Boolean),
                  });
                } catch (err) {
                  setError(errMessage(err, "Could not save the webhook."));
                }
              }}
            >
              <Field label="URL" htmlFor="webhook-url">
                <input
                  id="webhook-url"
                  type="url"
                  className="input font-mono text-sm"
                  value={shownUrl}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </Field>
              <Field label="Events (comma-separated)" htmlFor="webhook-events">
                <input
                  id="webhook-events"
                  className="input font-mono text-sm"
                  value={shownEvents}
                  onChange={(e) => setEvents(e.target.value)}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={w.is_active ?? false}
                  onChange={async (e) => {
                    setError(null);
                    try {
                      await update.mutateAsync({ id: params.id, is_active: e.target.checked });
                    } catch (err) {
                      setError(errMessage(err, "Could not update the webhook."));
                    }
                  }}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Active
              </label>
              <button type="submit" disabled={update.isPending} className="btn-primary text-sm">
                {update.isPending ? "Saving…" : "Save changes"}
              </button>
            </form>
            <p className="text-xs text-[var(--text-tertiary)]">
              Deliveries are signed with <span className="font-mono">X-Webhook-Signature</span> (HMAC-SHA256).
            </p>
          </>
        )}
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-sm font-semibold">Deliveries ({deliveries.length})</h2>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {deliveries.slice(0, 20).map((d) => (
            <div key={d.id} className="px-5 py-3 flex items-center gap-3">
              <span className={`badge ${DELIVERY_BADGE[d.status] ?? "badge-neutral"}`}>{d.status}</span>
              <span className="text-sm font-mono flex-1 truncate">{d.event}</span>
              <span className="text-xs text-[var(--text-tertiary)] shrink-0">
                {d.response_status ? `HTTP ${d.response_status}` : "no response"}
                {d.attempts ? ` · ${d.attempts} attempt${d.attempts === 1 ? "" : "s"}` : ""}
              </span>
              <span className="text-xs text-[var(--text-tertiary)] shrink-0">
                {new Date(d.delivered_at ?? d.created_at).toLocaleString()}
              </span>
            </div>
          ))}
          {deliveries.length === 0 && (
            <p className="px-5 py-6 text-sm text-[var(--text-tertiary)] text-center">
              No deliveries yet — fire the webhook from an automation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
