"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

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
      <h1 className="text-2xl font-semibold tracking-tight">Activities</h1>

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
              <tr key={activity.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {activity.subject}
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
