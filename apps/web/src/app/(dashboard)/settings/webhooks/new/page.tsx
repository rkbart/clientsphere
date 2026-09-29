"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, FormError } from "@/components/forms/fields";
import { useCreateWebhook } from "@/hooks/use-webhooks";
import { errMessage } from "@/lib/ai/error";
import { ChevronLeft } from "lucide-react";

export default function NewWebhookPage() {
  const router = useRouter();
  const create = useCreateWebhook();
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState("automation.executed");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <h1 className="text-2xl font-semibold tracking-tight mt-2">New Webhook</h1>
      </div>

      <div className="card p-6 space-y-4">
        <FormError message={error} />
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              const result = (await create.mutateAsync({
                url: url.trim(),
                events: events.split(",").map((s) => s.trim()).filter(Boolean),
                is_active: isActive,
              })) as unknown as { id: string };
              router.push(`/settings/webhooks/${result.id}`);
            } catch (err) {
              setError(errMessage(err, "Could not create the webhook."));
            }
          }}
        >
          <Field label="URL" htmlFor="webhook-url" required>
            <input
              id="webhook-url"
              type="url"
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/hook"
              required
            />
          </Field>
          <Field label="Events (comma-separated)" htmlFor="webhook-events" required>
            <input
              id="webhook-events"
              className="input font-mono text-sm"
              value={events}
              onChange={(e) => setEvents(e.target.value)}
              placeholder="automation.executed"
              required
            />
          </Field>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Active
          </label>
          <button type="submit" disabled={create.isPending || !url.trim()} className="btn-primary">
            {create.isPending ? "Creating…" : "Create webhook"}
          </button>
        </form>
      </div>
    </div>
  );
}
