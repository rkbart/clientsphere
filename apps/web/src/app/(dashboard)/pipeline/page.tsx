"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

interface PipelineData {
  id: string;
  name: string;
  is_default: boolean;
}

export default function PipelinePage() {
  const headers = () => getAuthHeadersForApi();

  const { data: pipelines, isLoading } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data } = await apiClient.GET("/pipelines", { headers: headers() });
      return data as unknown as { data: PipelineData[] };
    },
  });

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

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
          <p className="text-gray-500">No pipelines found.</p>
        </div>
      )}
    </div>
  );
}
