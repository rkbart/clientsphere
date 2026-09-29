"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function ActivitiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/activities", {
        params: { query: { per_page: 50 } },
        headers: getAuthHeadersForApi(),
      });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-sm text-[var(--text-secondary)]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activities</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Log calls, meetings, tasks and emails
          </p>
        </div>
        <Link href="/activities/new" className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Log Activity
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] divide-y divide-[var(--border-subtle)]">
          <thead className="bg-[var(--bg-elevated)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {data?.data?.map((activity: any) => (
              <tr key={activity.id} className="table-row">
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  <Link
                    href={`/activities/${activity.id}/edit`}
                    className="hover:text-[var(--text-secondary)] transition-colors"
                  >
                    {activity.subject}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)] capitalize">
                  {activity.kind}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)]">
                  {activity.due_at ? new Date(activity.due_at).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activity.completed_at ? "bg-emerald-50 text-emerald-700" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {activity.completed_at ? "Completed" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
