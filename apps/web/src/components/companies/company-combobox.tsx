"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/forms/fields";
import { useCompanies, useCompany, useCreateCompany } from "@/hooks/use-companies";
import { errMessage } from "@/lib/error";
import { Loader2, Plus, X } from "lucide-react";

interface CompanyOption {
  id: string;
  name: string;
}

// Search-as-you-type company picker. Matches the server-side `q` filter
// (debounced); when nothing matches, an inline "Create" row adds the company
// immediately (name only — details later on the Companies page) and selects
// it. Typing deselects so a stale pick can't be submitted by accident.
export function CompanyCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (companyId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [open, setOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const create = useCreateCompany();

  // Display name when the form opened with a company already assigned.
  const { data: selected } = useCompany(value);
  const selectedName = ((selected as unknown as { name?: string } | undefined)?.name) ?? "";
  useEffect(() => {
    if (value && selectedName && query === "") setQuery(selectedName);
  }, [value, selectedName, query]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data: companiesRes, isFetching } = useCompanies(
    { q: debouncedQ || undefined, per_page: 10 },
    { enabled: open },
  );
  const results = ((companiesRes as unknown as { data?: CompanyOption[] })?.data ?? []);
  const trimmed = query.trim();
  const exactMatch =
    trimmed !== "" &&
    results.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const pick = (c: CompanyOption) => {
    onChange(c.id);
    setQuery(c.name);
    setCreateError(null);
    setOpen(false);
  };

  const clear = () => {
    onChange("");
    setQuery("");
    setCreateError(null);
  };

  const createNew = async () => {
    if (!trimmed || create.isPending) return;
    setCreateError(null);
    try {
      const created = (await create.mutateAsync({ name: trimmed })) as unknown as {
        id: string;
        name: string;
      };
      onChange(created.id);
      setQuery(created.name ?? trimmed);
      setOpen(false);
    } catch (e) {
      setCreateError(errMessage(e, "Could not create the company."));
    }
  };

  return (
    <Field label="Company" htmlFor="contact-company-search">
      <div ref={rootRef} className="relative">
        <input
          id="contact-company-search"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-label="Company"
          className="input pr-8"
          value={query}
          placeholder="Search or create a company…"
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            onChange("");
            setCreateError(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && trimmed && !exactMatch && !isFetching) {
              e.preventDefault();
              void createNew();
            }
          }}
        />
        {(value || query) && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear company"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {open && (
          <div
            role="listbox"
            aria-label="Companies"
            className="card absolute z-20 mt-1 max-h-60 w-full overflow-auto p-1 shadow-lg"
          >
            {value && (
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={clear}
                className="block w-full rounded-[var(--radius-md)] px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
              >
                No company
              </button>
            )}
            {isFetching && (
              <p className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-tertiary)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching…
              </p>
            )}
            {!isFetching &&
              results.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={c.id === value}
                  onClick={() => pick(c)}
                  className={`block w-full truncate rounded-[var(--radius-md)] px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bg-elevated)] ${
                    c.id === value ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            {!isFetching && trimmed && !exactMatch && (
              <button
                type="button"
                onClick={() => void createNew()}
                disabled={create.isPending}
                className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm text-[var(--accent)] hover:bg-[var(--bg-elevated)] disabled:opacity-60"
              >
                {create.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {create.isPending ? "Creating…" : `Create "${trimmed}"`}
              </button>
            )}
            {!isFetching && !trimmed && results.length === 0 && (
              <p className="px-3 py-2 text-sm text-[var(--text-tertiary)]">
                No companies yet — type a name to create one.
              </p>
            )}
          </div>
        )}
      </div>
      {createError && (
        <p className="mt-1.5 text-xs text-[var(--danger)]">{createError}</p>
      )}
    </Field>
  );
}
