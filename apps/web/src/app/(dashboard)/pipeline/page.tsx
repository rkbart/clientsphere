"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export default function PipelinePage() {
  const { data: pipelines, isLoading } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/pipelines");
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

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const pipeline = pipelines?.data?.[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pipeline</h1>

      {pipeline ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{pipeline.name}</h2>
          <p className="text-gray-500">Kanban board coming soon...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No pipelines found. Create one in Settings.</p>
        </div>
      )}
    </div>
  );
}
