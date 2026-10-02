"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartStage {
  id: string;
  name: string;
  color?: string | null;
  kind?: string | null;
}

export interface ChartDeal {
  stage_id: string;
  amount: string | number | null;
  source?: string | null;
}

const DONUT_COLORS = ["var(--accent)", "var(--success)", "var(--danger)"];
const SOURCE_COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#64748b",
  "#ec4899",
  "#14b8a6",
];

const money = (n: number) => (n ? `$${Math.round(n).toLocaleString()}` : "$0");

export function DealCharts({ stages, deals }: { stages: ChartStage[]; deals: ChartDeal[] }) {
  const stageById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);

  const valueByStage = useMemo(
    () =>
      stages.map((stage) => ({
        name: stage.name,
        value: deals
          .filter((d) => d.stage_id === stage.id)
          .reduce((sum, d) => sum + (parseFloat(String(d.amount ?? "0")) || 0), 0),
        fill: stage.color || "#a8a29e",
      })),
    [stages, deals],
  );

  const outcome = useMemo(() => {
    const counts = { open: 0, won: 0, lost: 0 };
    for (const deal of deals) {
      const kind = stageById.get(deal.stage_id)?.kind ?? "open";
      if (kind === "won") counts.won += 1;
      else if (kind === "lost") counts.lost += 1;
      else counts.open += 1;
    }
    return [
      { name: "Open", value: counts.open },
      { name: "Won", value: counts.won },
      { name: "Lost", value: counts.lost },
    ];
  }, [deals, stageById]);

  const decided = outcome[1].value + outcome[2].value;
  const winRate = decided === 0 ? null : Math.round((outcome[1].value / decided) * 100);

  const sources = useMemo(() => {
    const counts = new Map<string, number>();
    for (const deal of deals) {
      const key = (deal.source ?? "").trim() || "Unspecified";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, value], i) => ({ name, value, fill: SOURCE_COLORS[i % SOURCE_COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [deals]);

  if (deals.length === 0) return null;

  const tick = { fill: "var(--text-tertiary)", fontSize: 12 };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-sm font-semibold">Pipeline value by stage</h2>
        </div>
        <div className="p-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={valueByStage} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <XAxis dataKey="name" tick={tick} interval="preserveEnd" angle={-12} textAnchor="end" height={48} />
              <YAxis tick={tick} tickFormatter={(v: number) => (v >= 1000 ? `$${v / 1000}k` : `$${v}`)} width={56} />
              <Tooltip
                formatter={(v) => [money(Number(v)), "Value"]}
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {valueByStage.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-sm font-semibold">Outcomes & win rate</h2>
        </div>
        <div className="p-5">
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {winRate === null ? "—" : `${winRate}%`}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {decided === 0 ? "No closed deals yet" : `${outcome[1].value} won · ${outcome[2].value} lost`}
          </p>
          <div className="h-44 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={outcome} dataKey="value" nameKey="name" innerRadius={44} outerRadius={64} paddingAngle={2}>
                  {outcome.map((entry, i) => (
                    <Cell key={entry.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-sm font-semibold">Deals by source</h2>
        </div>
        <div className="p-5 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sources} dataKey="value" nameKey="name" outerRadius={72} paddingAngle={2}>
                {sources.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1">
            {sources.map((s) => (
              <span key={s.name} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.fill }} />
                {s.name} · {s.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
