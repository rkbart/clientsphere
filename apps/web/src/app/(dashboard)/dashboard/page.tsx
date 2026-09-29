"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";
import { TrendingUp, Users, Activity } from "lucide-react";

interface StatsData {
  contacts: { meta: { total_count: number } };
  deals: { meta: { total_count: number } };
  activities: { meta: { total_count: number } };
}

interface ActivityItem {
  id: string;
  subject: string;
  kind: string;
  created_at: string;
}

export default function DashboardPage() {
  const headers = () => getAuthHeadersForApi();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [contacts, deals, activities] = await Promise.all([
        apiClient.GET("/contacts", { headers: headers() }),
        apiClient.GET("/deals", { headers: headers() }),
        apiClient.GET("/activities", { headers: headers() }),
      ]);
      return {
        contacts: contacts.data as unknown as { meta: { total_count: number } },
        deals: deals.data as unknown as { meta: { total_count: number } },
        activities: activities.data as unknown as { meta: { total_count: number } },
      };
    },
  });

  const { data: recentActivities } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const { data } = await apiClient.GET("/activities", { headers: headers() });
      return (data as unknown as { data: ActivityItem[] })?.data?.slice(0, 5) ?? [];
    },
  });

  const statCards = [
    { label: "Contacts", value: stats?.contacts?.meta?.total_count ?? 0, icon: Users, color: "text-[var(--text-primary)]" },
    { label: "Deals", value: stats?.deals?.meta?.total_count ?? 0, icon: TrendingUp, color: "text-emerald-600" },
    { label: "Activities", value: stats?.activities?.meta?.total_count ?? 0, icon: Activity, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
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
                  <p className="text-3xl font-semibold tracking-tight mt-2">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)]`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
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
