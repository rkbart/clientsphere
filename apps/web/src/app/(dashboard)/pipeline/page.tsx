"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { usePipelines, useStages } from "@/hooks/use-pipelines";
import { useDeals, useMoveDeal } from "@/hooks/use-deals";
import { ActionBanner, useActionNotice } from "@/components/shared/action-banner";
import { errMessage } from "@/lib/error";

interface Deal {
  id: string;
  title: string;
  amount: string | null;
  stage_id: string;
  position: number;
  expected_close_date: string | null;
}

interface DealsResponse {
  data: Deal[];
  meta: { total_count: number };
}

function formatMoney(value: number): string {
  return value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value.toFixed(0)}`;
}

const HIDE_CLOSED_KEY = "pipeline-hide-closed";

export default function PipelinePage() {
  const { data: pipelines, isLoading: pipelinesLoading } = usePipelines();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hideClosed, setHideClosed] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem(HIDE_CLOSED_KEY);
    return stored === null ? true : stored === "1";
  });
  const pipeline = useMemo(
    () =>
      (pipelines ?? []).find((p) => p.id === selectedId) ??
      pipelines?.find((p) => p.is_default) ??
      pipelines?.[0],
    [pipelines, selectedId]
  );
  const { data: stages, isLoading: stagesLoading } = useStages(pipeline?.id);
  const { data: dealsRes, isLoading: dealsLoading } = useDeals(
    pipeline ? { pipeline_id: pipeline.id, per_page: 100 } : undefined
  );
  const moveDeal = useMoveDeal();
  const { notice, notify, dismiss, undo, undoing } = useActionNotice();

  const toggleClosed = () => {
    setHideClosed((v) => {
      window.localStorage.setItem(HIDE_CLOSED_KEY, v ? "0" : "1");
      return !v;
    });
  };

  const deals = (dealsRes as unknown as DealsResponse)?.data ?? [];
  const visibleStages = useMemo(
    () => (stages ?? []).filter((s) => !hideClosed || s.kind === "open"),
    [stages, hideClosed]
  );

  const byStage = useMemo(() => {
    const map: Record<string, Deal[]> = {};
    for (const stage of stages ?? []) map[stage.id] = [];
    for (const deal of deals) {
      if (map[deal.stage_id]) map[deal.stage_id].push(deal);
    }
    for (const list of Object.values(map)) list.sort((a, b) => a.position - b.position);
    return map;
  }, [deals, stages]);

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const deal = deals.find((d) => d.id === draggableId);
    const toStage = (stages ?? []).find((s) => s.id === destination.droppableId);
    const fromStage = (stages ?? []).find((s) => s.id === source.droppableId);
    const from = { stageId: source.droppableId, position: source.index };

    moveDeal.mutate(
      { id: draggableId, stage_id: destination.droppableId, position: destination.index },
      {
        onSuccess: () =>
          notify({
            tone: "success",
            message:
              source.droppableId === destination.droppableId
                ? `Moved “${deal?.title ?? "deal"}” to position ${destination.index + 1} in ${toStage?.name ?? "stage"}.`
                : `Moved “${deal?.title ?? "deal"}” to ${toStage?.name ?? "stage"}.`,
            undo: async () => {
              await moveDeal.mutateAsync({
                id: draggableId,
                stage_id: from.stageId,
                position: from.position,
              });
            },
          }),
        onError: (e) =>
          notify({ tone: "error", message: errMessage(e, "Could not move that deal.") }),
      }
    );
  };

  if (pipelinesLoading || stagesLoading || dealsLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-72 shrink-0 h-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {pipeline?.name} · {deals.length} deals · drag cards between stages
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(pipelines ?? []).length > 1 && (
            <select
              value={pipeline?.id ?? ""}
              onChange={(e) => setSelectedId(e.target.value || null)}
              className="input w-auto text-sm"
              aria-label="Select pipeline"
            >
              {(pipelines ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={!hideClosed}
              onChange={toggleClosed}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Show closed
          </label>
        </div>
      </div>

      {notice && (
        <ActionBanner notice={notice} onUndo={() => void undo()} onDismiss={dismiss} undoing={undoing} />
      )}

      {visibleStages.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {visibleStages.map((stage) => {
              const list = byStage[stage.id] ?? [];
              const total = list.reduce((sum, d) => sum + (parseFloat(d.amount || "0") || 0), 0);
              return (
                <Droppable key={stage.id} droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`w-72 shrink-0 bg-[var(--bg-card)] border rounded-[var(--radius-lg)] flex flex-col max-h-[calc(100vh-240px)] transition-shadow duration-200 ${
                        snapshot.isDraggingOver
                          ? "border-[var(--accent)] shadow-[var(--shadow-md)]"
                          : "border-[var(--border)]"
                      }`}
                    >
                      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: stage.color || "#a8a29e" }}
                          />
                          <span className="text-sm font-medium truncate">{stage.name}</span>
                          <span className="ml-auto badge badge-neutral">{list.length}</span>
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1 tabular-nums">
                          {formatMoney(total)}
                          {stage.kind !== "open" && ` · ${stage.probability}%`}
                        </p>
                      </div>

                      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[80px]">
                        {list.map((deal, index) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(cardProvided, cardSnapshot) => (
                              <div
                                ref={cardProvided.innerRef}
                                {...cardProvided.draggableProps}
                                {...cardProvided.dragHandleProps}
                                style={cardProvided.draggableProps.style}
                              >
                                <Link
                                  href={`/deals/${deal.id}`}
                                  className={`block bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-3 cursor-grab active:cursor-grabbing transition-opacity duration-150 hover:border-[var(--text-tertiary)] ${
                                    cardSnapshot.isDragging ? "opacity-40 shadow-[var(--shadow-md)]" : ""
                                  }`}
                                >
                                  <p className="text-sm font-medium leading-snug">{deal.title}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm text-[var(--text-secondary)] tabular-nums">
                                      {deal.amount ? `$${parseFloat(deal.amount).toLocaleString()}` : "—"}
                                    </span>
                                    {deal.expected_close_date && (
                                      <span className="text-xs text-[var(--text-tertiary)]">
                                        {new Date(deal.expected_close_date).toLocaleDateString(undefined, {
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {list.length === 0 && snapshot.isDraggingOver && (
                          <div className="h-16 border border-dashed border-[var(--border)] rounded-[var(--radius-md)] flex items-center justify-center text-xs text-[var(--text-tertiary)]">
                            Drop here
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        <div className="card p-6 text-center">
          <p className="text-[var(--text-secondary)]">
            {!pipeline ? "No pipeline found." : "No open stages — turn on “Show closed” to see closed columns."}
          </p>
        </div>
      )}
    </div>
  );
}
