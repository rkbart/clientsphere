"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  usePipelines,
  useCreatePipeline,
  useUpdatePipeline,
  useDeletePipeline,
  useStages,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
  type Pipeline,
  type Stage,
} from "@/hooks/use-pipelines";
import { FormError } from "@/components/forms/fields";
import { ConfirmDialog } from "@/components/ui/modal";
import { ActionBanner, useActionNotice } from "@/components/shared/action-banner";
import { errMessage } from "@/lib/error";
import { ChevronLeft, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useCanManageSettings } from "@/hooks/use-current-role";
import { ManagerOnlyNotice } from "@/components/settings/manager-only-notice";

const KIND_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const KIND_DEFAULTS: Record<string, { color: string; probability: number }> = {
  open: { color: "#3B82F6", probability: 25 },
  won: { color: "#10B981", probability: 100 },
  lost: { color: "#EF4444", probability: 0 },
};

function StageRow({
  pipelineId,
  stage,
  onNotify,
}: {
  pipelineId: string;
  stage: Stage;
  onNotify: ReturnType<typeof useActionNotice>["notify"];
}) {
  const update = useUpdateStage();
  const remove = useDeleteStage();
  const [values, setValues] = useState({
    name: stage.name,
    kind: stage.kind,
    color: stage.color ?? "#3B82F6",
    probability: String(stage.probability ?? 0),
  });
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setValues({
      name: stage.name,
      kind: stage.kind,
      color: stage.color ?? "#3B82F6",
      probability: String(stage.probability ?? 0),
    });
  }, [stage]);

  const save = async () => {
    setError(null);
    const previous = {
      name: stage.name,
      kind: stage.kind,
      color: stage.color ?? "#3B82F6",
      probability: stage.probability ?? 0,
    };
    const next = {
      name: values.name.trim(),
      kind: values.kind,
      color: values.color,
      probability: Number(values.probability) || 0,
    };
    const unchanged =
      previous.name === next.name &&
      previous.kind === next.kind &&
      previous.color === next.color &&
      previous.probability === next.probability;
    if (unchanged) return;

    try {
      await update.mutateAsync({ pipeline_id: pipelineId, id: stage.id, ...next });
      onNotify({
        tone: "success",
        message: `Stage "${next.name}" saved.`,
        undo: async () => {
          await update.mutateAsync({ pipeline_id: pipelineId, id: stage.id, ...previous });
        },
      });
    } catch (e) {
      setError(errMessage(e, "Could not save the stage."));
    }
  };

  return (
    <div className="border border-[var(--border)] rounded-[var(--radius-md)] p-3 space-y-2">
      <FormError message={error} />
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_110px_90px_44px_auto] gap-2 items-center">
        <input
          aria-label="Stage name"
          className="input text-sm"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
          <select
            aria-label="Stage kind"
            className="input text-sm capitalize"
            value={values.kind}
            onChange={(e) => setValues((v) => ({ ...v, kind: e.target.value as Stage["kind"] }))}
          >
          {KIND_OPTIONS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <input
          aria-label="Probability"
          type="number"
          min="0"
          max="100"
          className="input text-sm"
          value={values.probability}
          onChange={(e) => setValues((v) => ({ ...v, probability: e.target.value }))}
        />
        <input
          aria-label="Color"
          type="color"
          className="h-9 w-11 p-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-transparent cursor-pointer"
          value={values.color}
          onChange={(e) => setValues((v) => ({ ...v, color: e.target.value }))}
        />
        <div className="flex gap-1">
          <button
            onClick={() => void save()}
            disabled={update.isPending || !values.name.trim()}
            className="btn-secondary text-sm"
          >
            {update.isPending ? "…" : "Save"}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="btn-ghost p-2 text-[var(--danger)]"
            aria-label={`Delete stage ${stage.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setError(null);
          remove.mutate(
            { pipeline_id: pipelineId, id: stage.id },
            {
              onSuccess: () => {
                setConfirmDelete(false);
                onNotify({ tone: "success", message: `Stage "${stage.name}" deleted.` });
              },
              onError: (e) => {
                setError(errMessage(e, "Could not delete the stage."));
                setConfirmDelete(false);
              },
            },
          );
        }}
        title="Delete stage?"
        message={`"${stage.name}" will be removed. Stages holding deals cannot be deleted — move the deals first.`}
        confirming={remove.isPending}
      />
    </div>
  );
}

export default function PipelinesSettingsPage() {
  const { data: pipelines, isLoading } = usePipelines();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newStage, setNewStage] = useState({ name: "", kind: "open" });
  const canManage = useCanManageSettings();

  const createPipeline = useCreatePipeline();
  const updatePipeline = useUpdatePipeline();
  const deletePipeline = useDeletePipeline();
  const createStage = useCreateStage();
  const deleteStage = useDeleteStage();
  const { notice, notify, dismiss, undo, undoing } = useActionNotice();

  const list = pipelines ?? [];
  const selected = list.find((p) => p.id === selectedId) ?? list.find((p) => p.is_default) ?? list[0] ?? null;
  const { data: stages } = useStages(selected?.id);
  const stageList = [...(stages ?? [])].sort((a, b) => a.position - b.position);

  const addPipeline = async () => {
    const name = newName.trim();
    if (!name) return;
    setError(null);
    try {
      const created = (await createPipeline.mutateAsync({ name })) as unknown as Pipeline;
      setNewName("");
      setSelectedId(created.id);
      notify({
        tone: "success",
        message: `Pipeline "${name}" created.`,
        // Undo is a delete: it only works while the new pipeline is empty,
        // which is exactly the window right after creating it.
        undo: () => deletePipeline.mutateAsync(created.id),
      });
    } catch (e) {
      setError(errMessage(e, "Could not create the pipeline."));
    }
  };

  const saveRename = async (pipeline: Pipeline) => {
    const name = renameValue.trim();
    if (!name || name === pipeline.name) {
      setEditingName(null);
      return;
    }
    setError(null);
    try {
      await updatePipeline.mutateAsync({ id: pipeline.id, name });
      setEditingName(null);
      notify({
        tone: "success",
        message: `Renamed to "${name}".`,
        undo: async () => {
          await updatePipeline.mutateAsync({ id: pipeline.id, name: pipeline.name });
        },
      });
    } catch (e) {
      setError(errMessage(e, "Could not rename the pipeline."));
    }
  };

  const addStage = async () => {
    if (!selected || !newStage.name.trim()) return;
    setError(null);
    try {
      const position = stageList.length === 0 ? 0 : Math.max(...stageList.map((s) => s.position)) + 1;
      const created = (await createStage.mutateAsync({
        pipeline_id: selected.id,
        name: newStage.name.trim(),
        kind: newStage.kind,
        position,
        color: KIND_DEFAULTS[newStage.kind]?.color ?? "#3B82F6",
        probability: KIND_DEFAULTS[newStage.kind]?.probability ?? 0,
      })) as unknown as Stage;
      setNewStage({ name: "", kind: "open" });
      notify({
        tone: "success",
        message: `Stage "${created.name}" added to ${selected.name}.`,
        undo: () => deleteStage.mutateAsync({ pipeline_id: selected.id, id: created.id }),
      });
    } catch (e) {
      setError(errMessage(e, "Could not add the stage."));
    }
  };

  if (!canManage) return <ManagerOnlyNotice title="Pipelines" />;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <Link
          href="/settings"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Pipelines</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Each pipeline is a separate sales process with its own stages. New pipelines start with the default 6 stages.
        </p>
      </div>

      <FormError message={error} />

      {notice && (
        <ActionBanner notice={notice} onUndo={() => void undo()} onDismiss={dismiss} undoing={undoing} />
      )}

      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-3">All pipelines</h2>
        {isLoading ? (
          <div className="h-10 bg-[var(--bg-elevated)] rounded animate-pulse" />
        ) : list.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)]">No pipelines yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {list.map((p) => (
              <li key={p.id} className="py-2 flex items-center gap-2">
                <button
                  onClick={() => setSelectedId(p.id)}
                  className={`flex-1 text-left text-sm px-2 py-1.5 rounded-[var(--radius-sm)] transition-colors ${
                    selected?.id === p.id
                      ? "bg-[var(--accent-soft)] font-medium"
                      : "hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {editingName === p.id ? (
                    <input
                      autoFocus
                      className="input text-sm"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void saveRename(p);
                        if (e.key === "Escape") setEditingName(null);
                      }}
                      onBlur={() => void saveRename(p)}
                      aria-label="Pipeline name"
                    />
                  ) : (
                    <span className="flex items-center gap-1.5">
                      {p.is_default && <Star className="h-3.5 w-3.5 text-[var(--warning-ink)]" aria-label="Default pipeline" />}
                      {p.name}
                    </span>
                  )}
                </button>
                {editingName !== p.id && (
                  <button
                    onClick={() => {
                      setRenameValue(p.name);
                      setEditingName(p.id);
                    }}
                    className="btn-ghost p-2"
                    aria-label={`Rename ${p.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {!p.is_default && (
                  <button
                    onClick={() => {
                      setError(null);
                      const previousDefault = list.find((x) => x.is_default);
                      updatePipeline.mutate(
                        { id: p.id, is_default: true },
                        {
                          onSuccess: () =>
                            notify({
                              tone: "success",
                              message: `"${p.name}" is now the default pipeline.`,
                              // Restoring means re-promoting whichever pipeline
                              // held the flag; if there was none, leave it be.
                              undo: async () => {
                                if (previousDefault) {
                                  await updatePipeline.mutateAsync({
                                    id: previousDefault.id,
                                    is_default: true,
                                  });
                                }
                              },
                            }),
                          onError: (e) => setError(errMessage(e, "Could not set default.")),
                        },
                      );
                    }}
                    className="btn-ghost text-xs"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => setConfirmDeleteId(p.id)}
                  className="btn-ghost p-2 text-[var(--danger)]"
                  aria-label={`Delete ${p.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 mt-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void addPipeline();
            }}
            placeholder="New pipeline name…"
            className="input text-sm flex-1"
            aria-label="New pipeline name"
          />
          <button
            onClick={() => void addPipeline()}
            disabled={createPipeline.isPending || !newName.trim()}
            className="btn-primary text-sm"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {selected && (
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold">Stages in {selected.name}</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Kinds drive behavior: <span className="font-medium">open</span> = in progress,{" "}
            <span className="font-medium">won</span>/<span className="font-medium">lost</span> = closed.
            Position sets left-to-right order.
          </p>
          {stageList.map((s) => (
            <StageRow key={s.id} pipelineId={selected.id} stage={s} onNotify={notify} />
          ))}
          <div className="flex flex-wrap gap-2 pt-1">
            <input
              value={newStage.name}
              onChange={(e) => setNewStage((v) => ({ ...v, name: e.target.value }))}
              placeholder="New stage name…"
              className="input text-sm flex-1 min-w-36"
              aria-label="New stage name"
            />
            <select
              value={newStage.kind}
              onChange={(e) => setNewStage((v) => ({ ...v, kind: e.target.value }))}
              className="input text-sm capitalize w-auto"
              aria-label="New stage kind"
            >
              {KIND_OPTIONS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => void addStage()}
              disabled={createStage.isPending || !newStage.name.trim()}
              className="btn-secondary text-sm"
            >
              <Plus className="h-4 w-4" />
              Add stage
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (!confirmDeleteId) return;
          setError(null);
          deletePipeline.mutate(confirmDeleteId, {
            onSuccess: () => {
              const removed = list.find((p) => p.id === confirmDeleteId);
              if (selectedId === confirmDeleteId) setSelectedId(null);
              setConfirmDeleteId(null);
              // No undo: recreating would issue a new id and lose the stage
              // ids, which deals may reference.
              notify({ tone: "success", message: `Pipeline "${removed?.name ?? "Untitled"}" deleted.` });
            },
            onError: (e) => {
              setError(errMessage(e, "Could not delete the pipeline."));
              setConfirmDeleteId(null);
            },
          });
        }}
        title="Delete pipeline?"
        message="Its stages will be removed too. Pipelines holding deals cannot be deleted — move the deals first."
        confirming={deletePipeline.isPending}
      />
    </div>
  );
}
