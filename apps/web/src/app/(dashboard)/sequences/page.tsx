"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSequences, useDeleteSequence } from "@/hooks/use-sequences";
import { errMessage } from "@/lib/error";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ActionBanner, useActionNotice } from "@/components/shared/action-banner";
import { ConfirmDialog } from "@/components/ui/modal";

interface Sequence {
  id: string;
  name: string;
  is_active: boolean;
}

export default function SequencesPage() {
  const router = useRouter();
  const { data, isLoading } = useSequences();
  const remove = useDeleteSequence();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Sequence | null>(null);
  const { notice, notify, dismiss } = useActionNotice();
  const list = ((data as unknown as { data?: Sequence[] })?.data ?? []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Email Sequences</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Drip emails with delays — steps run while the app is awake
          </p>
        </div>
        <Link href="/sequences/new" className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          New Sequence
        </Link>
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      {notice && <ActionBanner notice={notice} onDismiss={dismiss} />}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="table-cell table-header text-left">Name</th>
                <th className="table-cell table-header text-left">Status</th>
                <th className="table-cell table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {list.map((s) => (
                <tr
                  key={s.id}
                  onClick={(e) => {
                    const el = e.target as HTMLElement | null;
                    if (el?.closest?.("button, a, input, select, textarea")) return;
                    router.push(`/sequences/${s.id}`);
                  }}
                  onKeyDown={(e) => {
                    const el = e.target as HTMLElement | null;
                    if (el?.closest?.("button, a, input, select, textarea")) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/sequences/${s.id}`);
                    }
                  }}
                  tabIndex={0}
                  className="table-row cursor-pointer"
                >
                  <td className="table-cell font-medium">
                    <span>{s.name}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${s.is_active ? "badge-success" : "badge-neutral"}`}>
                      {s.is_active ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setConfirmDelete(s)}
                        className="btn-ghost p-2"
                        aria-label={`Delete ${s.name}`}
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
              No sequences yet — create one, add steps, enroll contacts.
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          const name = confirmDelete.name;
          setError(null);
          setConfirmDelete(null);
          remove.mutate(confirmDelete.id, {
            onSuccess: () => notify({ tone: "success", message: `Sequence “${name}” deleted.` }),
            onError: (e) => setError(errMessage(e, "Could not delete the sequence.")),
          });
        }}
        title="Delete sequence?"
        message={`“${confirmDelete?.name ?? ""}” and its steps and enrollments will be removed. This action cannot be undone.`}
        confirming={remove.isPending}
      />
    </div>
  );
}
