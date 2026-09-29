"use client";

import { useState } from "react";
import { useAiSettings, useEnrichCompany } from "@/hooks/use-ai";
import { useUpdateCompany } from "@/hooks/use-companies";
import { errMessage } from "@/lib/ai/error";
import { Sparkles, Check, X } from "lucide-react";

interface CompanyLike {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size_range: string;
  annual_revenue: number | null;
  description: string;
}

interface Enrichment {
  industry?: string;
  size_range?: string;
  description?: string;
  annual_revenue?: number | null;
}

const FIELDS = [
  { field: "industry", label: "Industry" },
  { field: "size_range", label: "Size range" },
  { field: "annual_revenue", label: "Annual revenue" },
  { field: "description", label: "Description" },
] as const;

export function AiEnrich({ company }: { company: CompanyLike }) {
  const { data: settings } = useAiSettings();
  const enrich = useEnrichCompany();
  const update = useUpdateCompany();
  const [preview, setPreview] = useState<Enrichment | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!settings?.enabled || !company.domain) return null;

  const run = async () => {
    setError(null);
    setPreview(null);
    try {
      const result = await enrich.mutateAsync(company.domain);
      const enriched: Enrichment = {
        industry: result.industry,
        size_range: result.size_range,
        description: result.description,
        annual_revenue:
          typeof result.annual_revenue === "number"
            ? result.annual_revenue
            : typeof result.annual_revenue === "string" && result.annual_revenue.trim() !== ""
              ? Number(result.annual_revenue) || null
              : null,
      };
      setPreview(enriched);
    } catch (e) {
      setError(errMessage(e, "Could not enrich this company."));
    }
  };

  const changedRows = FIELDS.map(({ field, label }) => {
    const next = preview?.[field];
    const current = company[field];
    const nextStr = next === null || next === undefined ? "" : String(next);
    const currentStr = current === null || current === undefined ? "" : String(current);
    return { field, label, current: currentStr, next: nextStr, changed: nextStr.trim() !== "" && nextStr !== currentStr };
  }).filter((row) => row.changed);

  const apply = async () => {
    const payload: Record<string, unknown> = { id: company.id };
    for (const row of changedRows) {
      payload[row.field] = row.field === "annual_revenue" ? Number(row.next) || null : row.next;
    }
    try {
      await update.mutateAsync(payload);
      setPreview(null);
    } catch (e) {
      setError(errMessage(e, "Could not save the enriched data."));
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-[var(--text-tertiary)]" />
        Enrich Company
      </h2>

      {!preview ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Look up <span className="font-mono">{company.domain}</span> and suggest public company data.
            Nothing is saved until you confirm.
          </p>
          <button onClick={run} disabled={enrich.isPending} className="btn-primary text-sm">
            {enrich.isPending ? "Looking up…" : "Enrich from domain"}
          </button>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        </div>
      ) : changedRows.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">No new information found for {company.domain}.</p>
          <button onClick={() => setPreview(null)} className="btn-secondary text-sm">
            Close
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-3">
            {changedRows.map((row) => (
              <li key={row.field} className="text-sm">
                <span className="text-[var(--text-secondary)]">{row.label}</span>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-[var(--text-tertiary)] line-through">{row.current || "—"}</span>
                  <span className="text-[var(--text-tertiary)]">→</span>
                  <span className="font-medium">{row.next}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button onClick={apply} disabled={update.isPending} className="btn-primary text-sm">
              <Check className="h-3.5 w-3.5" />
              {update.isPending ? "Applying…" : `Apply ${changedRows.length} change${changedRows.length === 1 ? "" : "s"}`}
            </button>
            <button onClick={() => setPreview(null)} className="btn-secondary text-sm">
              <X className="h-3.5 w-3.5" />
              Discard
            </button>
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        </div>
      )}
    </div>
  );
}
