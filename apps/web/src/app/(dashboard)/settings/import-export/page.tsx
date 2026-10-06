"use client";

import { useState } from "react";
import { Field, FormError } from "@/components/forms/fields";
import { ResultModal } from "@/components/ui/modal";
import { getAuthHeadersForApi } from "@/lib/api/client";
import { errMessage } from "@/lib/error";
import { ChevronLeft, Download, Upload } from "lucide-react";
import Link from "next/link";
import { useCanManageSettings } from "@/hooks/use-current-role";
import { ManagerOnlyNotice } from "@/components/settings/manager-only-notice";

const FIELDS = ["first_name", "last_name", "email", "phone"];
const ALIASES: Record<string, string> = {
  firstname: "first_name",
  "first name": "first_name",
  "given name": "first_name",
  lastname: "last_name",
  "last name": "last_name",
  surname: "last_name",
  "family name": "last_name",
  email: "email",
  "e-mail": "email",
  "email address": "email",
  phone: "phone",
  "phone number": "phone",
  tel: "phone",
  telephone: "phone",
  mobile: "phone",
};

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  total: number;
  errors: { row: number; data?: Record<string, string>; errors: string[] }[];
  errors_truncated: boolean;
}

function parseCsvPreview(text: string, maxRows = 5): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;
  const pushRow = () => {
    row.push(current);
    current = "";
    rows.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(current);
      current = "";
    } else if (ch === "\n") {
      pushRow();
      if (rows.length > maxRows) break;
    } else if (ch !== "\r") {
      current += ch;
    }
  }
  if (current !== "" || row.length > 0) pushRow();
  const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ""));
  const headers = nonEmpty[0] ?? [];
  return { headers, rows: nonEmpty.slice(1, maxRows + 1) };
}

function autoMatch(header: string): string {
  const key = header.trim().toLowerCase();
  if (FIELDS.includes(header.trim())) return header.trim();
  return ALIASES[key] ?? "";
}

export default function ImportExportSettingsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [dedupe, setDedupe] = useState("skip");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const canManage = useCanManageSettings();

  const pickFile = async (f: File | null) => {
    setFile(f);
    setResult(null);
    setError(null);
    if (!f) {
      setHeaders([]);
      setPreview([]);
      setMapping({});
      return;
    }
    const text = await f.text();
    const parsed = parseCsvPreview(text);
    setHeaders(parsed.headers);
    setPreview(parsed.rows);
    const initial: Record<string, string> = {};
    for (const h of parsed.headers) initial[h] = autoMatch(h);
    setMapping(initial);
  };

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const activeMapping: Record<string, string> = {};
      for (const [header, field] of Object.entries(mapping)) {
        if (field) activeMapping[header] = field;
      }
      const form = new FormData();
      form.append("file", file);
      form.append("mapping", JSON.stringify(activeMapping));
      form.append("dedupe", dedupe);
      const response = await fetch("/api/v1/import/csv", {
        method: "POST",
        headers: { ...getAuthHeadersForApi() },
        body: form,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Import failed");
      const imported = body as ImportResult;
      setResult(imported);
      setFeedback({
        tone: "success",
        title: "Import complete",
        message: `Imported ${imported.imported} row${imported.imported === 1 ? "" : "s"}${
          imported.skipped ? `, skipped ${imported.skipped}` : ""
        }.`,
      });
    } catch (err) {
      const message = errMessage(err, "Could not import the file.");
      setError(message);
      setFeedback({ tone: "error", title: "Import failed", message });
    } finally {
      setUploading(false);
    }
  };

  const download = async (type: string) => {
    setError(null);
    setFeedback(null);
    try {
      const response = await fetch(`/api/v1/export/csv/${type}`, {
        headers: { ...getAuthHeadersForApi() },
      });
      if (!response.ok) throw new Error(`Export of ${type} failed`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      // No confirmation of any kind: whether the file was saved or the user
      // cancelled the browser's download sheet is not knowable from here, so
      // any claim we made would be a guess.
    } catch (err) {
      setError(errMessage(err, "Could not export the file."));
    }
  };

  if (!canManage) return <ManagerOnlyNotice title="Import / Export" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/settings"
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to settings
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight mt-2">Import / Export</h1>
      <FormError message={error} />

      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">CSV Import — Contacts</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Upload a CSV, map its columns, and choose how to handle existing emails.
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--accent-soft)] file:text-[var(--text-primary)] hover:file:bg-[var(--border)]"
          aria-label="CSV file"
        />

        {headers.length > 0 && (
          <form onSubmit={upload} className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="table-cell table-header text-left">CSV column</th>
                    <th className="table-cell table-header text-left">Maps to</th>
                    <th className="table-cell table-header text-left">Sample</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {headers.map((h) => (
                    <tr key={h} className="table-row">
                      <td className="table-cell font-mono text-sm">{h}</td>
                      <td className="table-cell">
                        <select
                          value={mapping[h] ?? ""}
                          onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))}
                          className="input w-auto text-sm"
                          aria-label={`Map column ${h}`}
                        >
                          <option value="">Skip column</option>
                          {FIELDS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="table-cell text-[var(--text-secondary)] text-sm max-w-[12rem] truncate">
                        {preview[0]?.[headers.indexOf(h)] ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Field label="Existing emails" htmlFor="import-dedupe">
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="dedupe"
                    value="skip"
                    checked={dedupe === "skip"}
                    onChange={() => setDedupe("skip")}
                  />
                  Skip
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="dedupe"
                    value="update"
                    checked={dedupe === "update"}
                    onChange={() => setDedupe("update")}
                  />
                  Update
                </label>
              </div>
            </Field>

            <button type="submit" disabled={uploading} className="btn-primary">
              <Upload className="h-4 w-4" />
              {uploading ? "Importing…" : "Import contacts"}
            </button>
          </form>
        )}

        {result && (
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-4 space-y-2">
            <p className="text-sm font-medium">
              Imported {result.imported} · Updated {result.updated} · Skipped {result.skipped}
            </p>
            {result.errors.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="table-cell table-header text-left">Row</th>
                      <th className="table-cell table-header text-left">Problem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {result.errors.map((e, i) => (
                      <tr key={i} className="table-row">
                        <td className="table-cell tabular-nums">{e.row}</td>
                        <td className="table-cell text-[var(--danger)]">{e.errors.join("; ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.errors_truncated && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-2">
                    Showing the first {result.errors.length} errors.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <ResultModal
        open={!!feedback}
        onClose={() => setFeedback(null)}
        tone={feedback?.tone ?? "success"}
        title={feedback?.title ?? ""}
        message={feedback?.message ?? ""}
      />

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">CSV Export</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Export your data as CSV files.</p>
        <div className="flex flex-wrap gap-2">
          {(["contacts", "companies", "deals"] as const).map((t) => (
            <button key={t} onClick={() => download(t)} className="btn-secondary capitalize">
              <Download className="h-4 w-4" />
              Export {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
