"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";
import { usePipelines, useStages } from "@/hooks/use-pipelines";
import { useDeals } from "@/hooks/use-deals";
import { TrendingUp, Users, Activity, ChevronRight, CheckCircle2, Circle } from "lucide-react";

const headers = () => getAuthHeadersForApi();

interface ActivityItem {
  id: string;
  subject: string;
  kind: string;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface DealRow {
  id: string;
  stage_id: string;
  amount: string | null;
}

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [contacts, deals, activities] = await Promise.all([
        apiClient.GET("/contacts", { params: { query: { per_page: 1 } }, headers: headers() }),
        apiClient.GET("/deals", { params: { query: { per_page: 1 } }, headers: headers() }),
        apiClient.GET("/activities", { params: { query: { per_page: 1 } }, headers: headers() }),
      ]);
      return {
        contacts: (contacts.data as unknown as { meta: { total_count: number } })?.meta?.total_count ?? 0,
        deals: (deals.data as unknown as { meta: { total_count: number } })?.meta?.total_count ?? 0,
        activities: (activities.data as unknown as { meta: { total_count: number } })?.meta?.total_count ?? 0,
      };
    },
  });

  const { data: recentActivities } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const { data } = await apiClient.GET("/activities", {
        params: { query: { per_page: 5, sort: "created_at", order: "desc" } },
        headers: headers(),
      });
      return ((data as unknown as { data: ActivityItem[] })?.data ?? []).slice(0, 5);
    },
  });

  const { data: dueTasks } = useQuery({
    queryKey: ["due-tasks"],
    queryFn: async () => {
      const { data } = await apiClient.GET("/activities", {
        params: { query: { kind: "task", completed: "false", per_page: 5 } },
        headers: headers(),
      });
      return (data as unknown as { data: ActivityItem[] })?.data ?? [];
    },
  });

  const { data: pipelines } = usePipelines();
  const pipeline = useMemo(
    () => pipelines?.find((p) => p.is_default) ?? pipelines?.[0],
    [pipelines]
  );
  const { data: stages } = useStages(pipeline?.id);
  const { data: dealsRes } = useDeals(
    pipeline ? { pipeline_id: pipeline.id, per_page: 100 } : undefined
  );
  const deals = (dealsRes as unknown as { data: DealRow[] })?.data ?? [];

  const stageStats = useMemo(() => {
    if (!stages) return [];
    return stages.map((stage) => {
      const list = deals.filter((d) => d.stage_id === stage.id);
      const value = list.reduce((sum, d) => sum + (parseFloat(d.amount || "0") || 0), 0);
      return { stage, count: list.length, value };
    });
  }, [stages, deals]);
  const maxCount = Math.max(1, ...stageStats.map((s) => s.count));

  const statCards = [
    { label: "Contacts", value: stats?.contacts ?? 0, icon: Users, color: "text-[var(--text-primary)]" },
    { label: "Deals", value: stats?.deals ?? 0, icon: TrendingUp, color: "text-[var(--text-primary)]" },
    { label: "Activities", value: stats?.activities ?? 0, icon: Activity, color: "text-[var(--text-primary)]" },
  ];

  const now = Date.now();
  const dueLabel = (dueAt: string | null) => {
    if (!dueAt) return { text: "No due date", className: "text-[var(--text-tertiary)]" };
    const t = new Date(dueAt).getTime();
    if (t < now) return { text: `Overdue · ${new Date(dueAt).toLocaleDateString()}`, className: "text-[var(--danger)]" };
    if (new Date(dueAt).toDateString() === new Date().toDateString())
      return { text: "Due today", className: "text-[var(--warning)]" };
    return { text: new Date(dueAt).toLocaleDateString(), className: "text-[var(--text-tertiary)]" };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">Overview of your CRM data</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-semibold tracking-tight mt-2 tabular-nums">{stat.value}</p>
                </div>
                <div className="p-2.5 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)]">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline by stage */}
        <div className="card">
          <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pipeline by stage</h2>
            <Link
              href="/pipeline"
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-0.5 transition-colors"
            >
              Board <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-5 space-y-3">
            {stageStats.map(({ stage, count, value }) => (
              <div key={stage.id} className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: stage.color || "#a8a29e" }}
                />
                <span className="text-sm w-28 shrink-0 truncate">{stage.name}</span>
                <div className="flex-1 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      backgroundColor: stage.color || "#a8a29e",
                    }}
                  />
                </div>
                <span className="text-xs text-[var(--text-tertiary)] w-6 text-right tabular-nums">{count}</span>
                <span className="text-sm text-[var(--text-secondary)] w-20 text-right tabular-nums">
                  {value ? `$${value.toLocaleString()}` : "—"}
                </span>
              </div>
            ))}
            {stageStats.length === 0 && (
              <p className="text-sm text-[var(--text-tertiary)] text-center py-4">No pipeline data</p>
            )}
          </div>
        </div>

        {/* Tasks due */}
        <div className="card">
          <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="text-sm font-semibold">Tasks due</h2>
            <Link
              href="/activities"
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-0.5 transition-colors"
            >
              All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {dueTasks?.map((task) => {
              const due = dueLabel(task.due_at);
              return (
                <div key={task.id} className="px-5 py-3 flex items-center gap-3 hover:bg-[var(--bg-elevated)] transition-colors duration-150">
                  <Circle className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                  <span className="text-sm flex-1 truncate">{task.subject}</span>
                  <span className={`text-xs shrink-0 ${due.className}`}>{due.text}</span>
                </div>
              );
            })}
            {dueTasks?.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-[var(--text-tertiary)]">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-[var(--success)]" />
                All clear — no open tasks
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {recentActivities?.map((activity) => (
            <div key={activity.id} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-[var(--bg-elevated)] transition-colors duration-150">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{activity.subject}</p>
                  <p className="text-xs text-[var(--text-tertiary)] capitalize">{activity.kind}</p>
                </div>
              </div>
              <span className="text-xs text-[var(--text-tertiary)] shrink-0">
                {new Date(activity.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
          {(!recentActivities || recentActivities.length === 0) && (
            <div className="px-5 py-8 text-center text-sm text-[var(--text-tertiary)]">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
