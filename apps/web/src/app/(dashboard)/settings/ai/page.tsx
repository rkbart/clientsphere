"use client";

import { useEffect, useState } from "react";
import { PROVIDERS, DEFAULT_PROVIDER, displayName } from "@/lib/ai/providers";
import { loadSettingsStore, saveSettingsStore } from "@/lib/ai/local-provider";
import type { AIProvider } from "@/types/ai";
import { useAiSettings, useUpdateAiSettings, useTestAiConnection } from "@/hooks/use-ai";
import { CheckCircle2, ChevronLeft, XCircle, Server, Laptop, Zap } from "lucide-react";
import Link from "next/link";
import { useCanManageSettings } from "@/hooks/use-current-role";
import { ManagerOnlyNotice } from "@/components/settings/manager-only-notice";

interface FormState {
  provider: string;
  model: string;
  base_url: string;
  api_key: string;
  enabled: boolean;
  redact_pii: boolean;
}

function errMessage(error: unknown): string {
  if (!error) return "Something went wrong.";
  if (typeof error === "object" && error !== null && "error" in error) {
    const e = (error as { error: unknown }).error;
    if (typeof e === "string") return e;
    if (Array.isArray(e)) return e.join(", ");
  }
  return "Something went wrong.";
}

export default function AISettingsPage() {
  const { data: settings, isLoading } = useAiSettings();
  const update = useUpdateAiSettings();
  const test = useTestAiConnection();
  const [form, setForm] = useState<FormState | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings || form) return;
    const def = PROVIDERS.find((p) => p.id === settings.provider)
      ?? PROVIDERS.find((p) => p.id === DEFAULT_PROVIDER)!;
    setForm({
      provider: def.id,
      model: settings.model ?? def.defaultModel,
      base_url: settings.base_url ?? "",
      api_key: "",
      enabled: settings.enabled ?? false,
      redact_pii: settings.redact_pii ?? false,
    });
  }, [settings, form]);

  const def = form ? (PROVIDERS.find((p) => p.id === form.provider) ?? PROVIDERS.find((p) => p.id === DEFAULT_PROVIDER)!) : null;
  const hasSavedKey = settings?.api_key_set ?? false;

  const handleSave = async () => {
    if (!form || !def) return;
    const model = form.model || def.defaultModel;
    const base_url = def.editableEndpoint ? (form.base_url || def.baseURL) : def.baseURL;
    const payload: Record<string, unknown> = {
      provider: form.provider,
      model,
      base_url,
      enabled: form.enabled,
      redact_pii: form.redact_pii,
    };
    if (form.api_key) payload.api_key = form.api_key;

    try {
      await update.mutateAsync(payload);
      if (def.local) {
        const prev = loadSettingsStore();
        saveSettingsStore({
          ...prev,
          provider: form.provider as AIProvider,
          models: { ...prev.models, [form.provider]: model },
          baseURLs: { ...prev.baseURLs, [form.provider]: base_url },
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // error surfaced via update.error below
    }
  };

  const canManage = useCanManageSettings();

  if (!canManage) return <ManagerOnlyNotice title="AI Settings" />;

  if (isLoading || !form || !def) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">AI Settings</h1>
        <div className="card p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const modelOptions = [...def.models];
  if (form.model && !modelOptions.some((m) => m.value === form.model)) {
    modelOptions.unshift({ value: form.model, label: form.model });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/settings"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to settings
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">AI Settings</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Bring your own model — keys are stored encrypted and never returned.
          </p>
        </div>
        <span className={`badge self-start sm:self-auto ${def.local ? "badge-success" : "badge-info"} gap-1.5`}>
          {def.local ? <Laptop className="h-3.5 w-3.5" /> : <Server className="h-3.5 w-3.5" />}
          {def.local ? "Local mode" : "Server mode"}
        </span>
      </div>

      <div className="card p-6 space-y-6">
        {/* Provider */}
        <div>
          <label htmlFor="ai-provider" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Provider
          </label>
          <select
            id="ai-provider"
            value={form.provider}
            onChange={(e) => {
              const next = PROVIDERS.find((p) => p.id === e.target.value) ?? def;
              setForm({
                ...form,
                provider: next.id,
                model: next.defaultModel,
                base_url: "",
                api_key: "",
              });
            }}
            className="input"
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
                {p.freeNote ? ` — ${p.freeNote}` : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5">{def.hint}</p>
        </div>

        {/* API key */}
        {def.needsKey && (
          <div>
            <label htmlFor="ai-key" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              API key
              {hasSavedKey && !form.api_key && (
                <span className="badge badge-success ml-2 align-middle">Saved</span>
              )}
            </label>
            <input
              id="ai-key"
              type="password"
              value={form.api_key}
              onChange={(e) => setForm({ ...form, api_key: e.target.value })}
              placeholder={hasSavedKey ? "••••••••  (leave blank to keep current key)" : def.keyPlaceholder}
              autoComplete="off"
              className="input"
            />
            {def.keyUrl && (
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                Get a key at{" "}
                <a href={def.keyUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--text-primary)]">
                  {def.keyUrlLabel}
                </a>
              </p>
            )}
            {!hasSavedKey && !form.api_key && (
              <p className="text-xs text-[var(--warning)] mt-1.5">No key saved yet.</p>
            )}
          </div>
        )}

        {/* Model */}
        <div>
          <label htmlFor="ai-model" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Model
          </label>
          {modelOptions.length > 0 ? (
            <select
              id="ai-model"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="input"
            >
              {modelOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="ai-model"
              type="text"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="Exact model identifier shown in your local app"
              className="input"
            />
          )}
        </div>

        {/* Base URL */}
        {def.editableEndpoint && (
          <div>
            <label htmlFor="ai-base-url" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Endpoint URL
            </label>
            <input
              id="ai-base-url"
              type="text"
              value={form.base_url}
              onChange={(e) => setForm({ ...form, base_url: e.target.value })}
              placeholder={def.baseURL}
              className="input"
            />
          </div>
        )}

        {/* Privacy */}
        <div className="space-y-3 border-t border-[var(--border-subtle)] pt-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
            />
            <span className="text-sm">
              <span className="font-medium text-[var(--text-primary)]">Enable AI</span>
              <span className="block text-[var(--text-secondary)]">
                {form.enabled
                  ? def.local
                    ? "Runs on your machine — data never leaves this device."
                    : `Selected CRM data is sent to ${displayName(def)}.`
                  : "Off by default. AI features stay disabled until you turn this on."}
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.redact_pii}
              onChange={(e) => setForm({ ...form, redact_pii: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
            />
            <span className="text-sm">
              <span className="font-medium text-[var(--text-primary)]">Redact personal data</span>
              <span className="block text-[var(--text-secondary)]">
                Mask emails and phone numbers before sending context to the provider.
              </span>
            </span>
          </label>
        </div>

        {/* Test + Save */}
        <div className="border-t border-[var(--border-subtle)] pt-5 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => test.mutate()}
              disabled={test.isPending}
              className="btn-secondary"
            >
              <Zap className="h-4 w-4" />
              {test.isPending ? "Testing…" : "Test connection"}
            </button>
            <button onClick={handleSave} disabled={update.isPending} className="btn-primary">
              {saved ? "Saved!" : update.isPending ? "Saving…" : "Save"}
            </button>
          </div>

          {test.data && (
            <p className={`text-sm flex items-center gap-1.5 ${test.data.success ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
              {test.data.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
              {test.data.message}
            </p>
          )}
          {test.isError && (
            <p className="text-sm text-[var(--danger)]">{errMessage(test.error)}</p>
          )}
          {update.isError && (
            <p className="text-sm text-[var(--danger)]">{errMessage(update.error)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
