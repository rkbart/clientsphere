"use client";

import { useMemo } from "react";
import Link from "next/link";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { usePipelines, useStages } from "@/hooks/use-pipelines";
import { useDeals, useMoveDeal } from "@/hooks/use-deals";

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

export default function PipelinePage() {
  const { data: pipelines, isLoading: pipelinesLoading } = usePipelines();
  const pipeline = useMemo(
    () => pipelines?.find((p) => p.is_default) ?? pipelines?.[0],
    [pipelines]
  );
  const { data: stages, isLoading: stagesLoading } = useStages(pipeline?.id);
  const { data: dealsRes, isLoading: dealsLoading } = useDeals(
    pipeline ? { pipeline_id: pipeline.id, per_page: 100 } : undefined
  );
  const moveDeal = useMoveDeal();

  const deals = (dealsRes as unknown as DealsResponse)?.data ?? [];

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
    moveDeal.mutate({
      id: draggableId,
      stage_id: destination.droppableId,
      position: destination.index,
    });
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          {pipeline?.name} · {deals.length} deals · drag cards between stages
        </p>
      </div>

      {stages && stages.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {stages.map((stage) => {
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
          <p className="text-[var(--text-secondary)]">No pipeline found.</p>
        </div>
      )}
    </div>
  );
}
