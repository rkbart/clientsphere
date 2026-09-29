"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export default function DashboardPage() {
  const { data: contacts } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/contacts");
      if (error) throw error;
      return data;
    },
  });

  const { data: deals } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/deals");
      if (error) throw error;
      return data;
    },
  });

  const { data: activities } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/activities");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Contacts</h3>
          <p className="text-3xl font-bold mt-2">{contacts?.meta?.total_count || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Open Deals</h3>
          <p className="text-3xl font-bold mt-2">{deals?.meta?.total_count || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Pending Tasks</h3>
          <p className="text-3xl font-bold mt-2">{activities?.meta?.total_count || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activities?.data?.slice(0, 5).map((activity: any) => (
            <div key={activity.id} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">{activity.subject}</p>
                <p className="text-sm text-gray-500">{activity.kind}</p>
              </div>
              <span className="text-sm text-gray-400">
                {new Date(activity.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
