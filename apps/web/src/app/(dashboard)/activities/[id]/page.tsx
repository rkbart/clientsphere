"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useActivity, useDeleteActivity, useUpdateActivity } from "@/hooks/use-activities";
import { useQueryClient } from "@tanstack/react-query";
import { useContact } from "@/hooks/use-contacts";
import { useCompany } from "@/hooks/use-companies";
import { useDeal } from "@/hooks/use-deals";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { ActivityForm, type ActivityFormValues } from "@/components/activities/activity-form";
import { FormError } from "@/components/forms/fields";
import { errMessage } from "@/lib/ai/error";
import { CheckCircle2, ChevronLeft, Circle, Pencil, Trash2 } from "lucide-react";

interface ActivityData {
  id: string;
  kind?: string | null;
  subject?: string | null;
  description?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  deal_id?: string | null;
  due_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export default function ActivityDetailPage() {
  const routeParams = useParams<{ id: string }>();
  const id = Array.isArray(routeParams?.id) ? routeParams.id[0] : (routeParams?.id ?? "");
  const router = useRouter();
  const { data, isLoading } = useActivity(id);
  const remove = useDeleteActivity();
  const update = useUpdateActivity();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const activity = data as unknown as ActivityData | undefined;

  const { data: contactData } = useContact(activity?.contact_id ?? "", {
    enabled: !!activity?.contact_id,
  });
  const { data: companyData } = useCompany(activity?.company_id ?? "", {
    enabled: !!activity?.company_id,
  });
  const { data: dealData } = useDeal(activity?.deal_id ?? "", {
    enabled: !!activity?.deal_id,
  });
  const contact = contactData as unknown as { id: string; first_name: string; last_name?: string | null } | undefined;
  const company = companyData as unknown as { id: string; name: string } | undefined;
  const deal = dealData as unknown as { id: string; title: string } | undefined;

  if (isLoading) return <div className="text-center py-8 text-sm text-[var(--text-secondary)]">Loading...</div>;
  if (!activity) return <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">Activity not found</div>;

  const completed = !!activity.completed_at;
  const overdue = !completed && !!activity.due_at && new Date(activity.due_at) < new Date();

  const toggleComplete = async () => {
    setEditError(null);
    try {
      await update.mutateAsync({
        id: activity.id,
        completed_at: completed ? null : new Date().toISOString(),
      });
      // Keep deal-scoped surfaces truthful (summary count, attention card,
      // dashboard widget) — the hook only refreshes the activities cache.
      queryClient.invalidateQueries({ queryKey: ["due-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "attention"] });
      if (activity.deal_id) {
        queryClient.invalidateQueries({ queryKey: ["deals", activity.deal_id, "summary"] });
      }
    } catch (e) {
      setEditError(errMessage(e, "Could not update the activity."));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <Link
          href="/activities"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to activities
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <h1 className="text-2xl font-semibold tracking-tight">{activity.subject}</h1>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => void toggleComplete()}
              disabled={update.isPending}
              className="btn-secondary text-sm"
            >
              {completed ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {completed ? "Reopen" : "Complete"}
            </button>
            <button
              onClick={() => { setEditError(null); setEditOpen(true); }}
              className="btn-secondary text-sm"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => { setDeleteError(null); setConfirmDelete(true); }}
              className="btn-secondary text-sm !text-[var(--danger)]"
              aria-label="Delete activity"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <FormError message={editError} />

      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4">Activity details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Type</dt>
            <dd className="mt-0.5 text-sm capitalize">{activity.kind || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Status</dt>
            <dd className="mt-0.5 text-sm">
              <span className={`badge ${completed ? "badge-success" : overdue ? "badge-danger" : "badge-warning"}`}>
                {completed ? "Completed" : overdue ? "Overdue" : "Open"}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Due date</dt>
            <dd className="mt-0.5 text-sm">
              {activity.due_at ? new Date(activity.due_at).toLocaleDateString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Completed</dt>
            <dd className="mt-0.5 text-sm">
              {activity.completed_at ? new Date(activity.completed_at).toLocaleString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Contact</dt>
            <dd className="mt-0.5 text-sm">
              {contact ? (
                <Link href={`/contacts/${contact.id}`} className="hover:text-[var(--accent-hover)] transition-colors">
                  {contact.first_name} {contact.last_name ?? ""}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Company</dt>
            <dd className="mt-0.5 text-sm">
              {company ? (
                <Link href={`/companies/${company.id}`} className="hover:text-[var(--accent-hover)] transition-colors">
                  {company.name}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Deal</dt>
            <dd className="mt-0.5 text-sm">
              {deal ? (
                <Link href={`/deals/${deal.id}`} className="hover:text-[var(--accent-hover)] transition-colors">
                  {deal.title}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Created</dt>
            <dd className="mt-0.5 text-sm">{new Date(activity.created_at).toLocaleDateString()}</dd>
          </div>
        </dl>
        {activity.description && (
          <>
            <hr className="my-4 border-[var(--border-subtle)]" />
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">
              {activity.description}
            </p>
          </>
        )}
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit activity"
        description="Update this activity's details."
      >
        <FormError message={editError} />
        <ActivityForm
          initial={{
            kind: activity.kind ?? "task",
            subject: activity.subject ?? "",
            description: activity.description ?? "",
            contact_id: activity.contact_id ?? "",
            company_id: activity.company_id ?? "",
            deal_id: activity.deal_id ?? "",
            due_at: (activity.due_at ?? "").slice(0, 10),
          }}
          submitting={update.isPending}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            setEditError(null);
            try {
              await update.mutateAsync({ id: activity.id, ...values });
              setEditOpen(false);
            } catch (e) {
              setEditError(errMessage(e, "Could not save the activity."));
            }
          }}
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setDeleteError(null);
          remove.mutate(activity.id, {
            onSuccess: () => router.push("/activities"),
            onError: (e) => setDeleteError(errMessage(e, "Could not delete the activity.")),
          });
        }}
        title="Delete activity?"
        message={`${activity.subject ?? "This activity"} will be permanently removed. This action cannot be undone.`}
        confirming={remove.isPending}
        error={deleteError}
      />
    </div>
  );
}
