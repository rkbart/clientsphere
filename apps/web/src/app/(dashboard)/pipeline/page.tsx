"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePipelines, useStages, type Stage } from "@/hooks/use-pipelines";
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

  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

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

  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    setOverStage(null);
    setDragId(null);
    if (!id) return;

    const cards = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>("[data-deal-card]")
    );
    let index = cards.length;
    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        index = i;
        break;
      }
    }
    const fromIdx = cards.findIndex((c) => c.dataset.dealId === id);
    if (fromIdx !== -1 && fromIdx < index) index -= 1;

    moveDeal.mutate({ id, stage_id: stage.id, position: index });
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
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {stages.map((stage) => {
            const list = byStage[stage.id] ?? [];
            const total = list.reduce((sum, d) => sum + (parseFloat(d.amount || "0") || 0), 0);
            const isOver = overStage === stage.id;
            return (
              <div
                key={stage.id}
                data-stage-column={stage.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (overStage !== stage.id) setOverStage(stage.id);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setOverStage(null);
                  }
                }}
                onDrop={(e) => handleDrop(e, stage)}
                className={`w-72 shrink-0 bg-[var(--bg-card)] border rounded-[var(--radius-lg)] flex flex-col max-h-[calc(100vh-240px)] transition-shadow duration-200 ${
                  isOver
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
                  {list.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      data-deal-card
                      data-deal-id={deal.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", deal.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDragId(deal.id);
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverStage(null);
                      }}
                      onClick={(e) => {
                        if (dragId) e.preventDefault();
                      }}
                      className={`block bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-3 cursor-grab active:cursor-grabbing transition-opacity duration-150 hover:border-[var(--text-tertiary)] ${
                        dragId === deal.id ? "opacity-40" : ""
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
                  ))}

                  {list.length === 0 && isOver && (
                    <div className="h-16 border border-dashed border-[var(--border)] rounded-[var(--radius-md)] flex items-center justify-center text-xs text-[var(--text-tertiary)]">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-6 text-center">
          <p className="text-[var(--text-secondary)]">No pipeline found.</p>
        </div>
      )}
    </div>
  );
}
