"use client";

import { useEffect, useState } from "react";
import { useContacts } from "@/hooks/use-contacts";
import { useTags } from "@/hooks/use-tags";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  lead_score: number;
  status: number;
}

interface ContactsResponse {
  data: Contact[];
  meta: { total_count: number; total_pages: number; current_page: number; per_page: number };
}

export default function ContactsPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [tagId, setTagId] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading } = useContacts({
    q: debouncedQ || undefined,
    tag_id: tagId || undefined,
    per_page: 25,
  });
  const { data: tags } = useTags();
  const typed = data as unknown as ContactsResponse;
  const isFiltered = !!debouncedQ || !!tagId;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {typed?.meta?.total_count ?? 0} contacts
          </p>
        </div>
        <Link
          href="/contacts/new"
          className="btn-primary self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email…"
            className="input pl-9"
            aria-label="Search contacts"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            className="input w-auto min-w-[10rem]"
            aria-label="Filter by tag"
          >
            <option value="">All tags</option>
            {tags?.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          {isFiltered && (
            <button
              onClick={() => {
                setQ("");
                setTagId("");
              }}
              className="btn-ghost"
              aria-label="Clear filters"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="table-cell table-header text-left">Name</th>
              <th className="table-cell table-header text-left">Email</th>
              <th className="table-cell table-header text-left">Phone</th>
              <th className="table-cell table-header text-left">Score</th>
              <th className="table-cell table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="table-row">
                  <td className="table-cell"><div className="h-4 bg-[var(--bg-elevated)] rounded w-32 animate-pulse" /></td>
                  <td className="table-cell"><div className="h-4 bg-[var(--bg-elevated)] rounded w-40 animate-pulse" /></td>
                  <td className="table-cell"><div className="h-4 bg-[var(--bg-elevated)] rounded w-24 animate-pulse" /></td>
                  <td className="table-cell"><div className="h-5 bg-[var(--bg-elevated)] rounded-full w-8 animate-pulse" /></td>
                  <td className="table-cell text-right"><div className="h-4 bg-[var(--bg-elevated)] rounded w-12 animate-pulse ml-auto" /></td>
                </tr>
              ))
            ) : (
              typed?.data?.map((contact) => (
                <tr key={contact.id} className="table-row">
                  <td className="table-cell">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-hover)] transition-colors"
                    >
                      {contact.first_name} {contact.last_name}
                    </Link>
                  </td>
                  <td className="table-cell text-[var(--text-secondary)]">{contact.email}</td>
                  <td className="table-cell text-[var(--text-secondary)]">{contact.phone}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      contact.lead_score >= 70 ? "badge-success" :
                      contact.lead_score >= 40 ? "badge-warning" :
                      "badge-neutral"
                    }`}>
                      {contact.lead_score}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {!isLoading && (!typed?.data || typed.data.length === 0) && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              {isFiltered ? "No contacts match your filters" : "No contacts found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
