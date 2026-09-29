"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export default function ActivitiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/activities");
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Activities</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.data?.map((activity: any) => (
              <tr key={activity.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {activity.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 capitalize">
                  {activity.kind}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {activity.due_at ? new Date(activity.due_at).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activity.completed_at ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
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
  );
}
