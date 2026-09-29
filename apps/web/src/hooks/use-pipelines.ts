import { useQuery } from "@tanstack/react-query";
import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";

const headers = () => getAuthHeadersForApi();

export interface Pipeline {
  id: string;
  name: string;
  is_default: boolean;
}

export interface Stage {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  color: string | null;
  probability: number;
  kind: "open" | "won" | "lost";
}

export function usePipelines() {
  return useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/pipelines", { headers: headers() });
      if (error) throw error;
      return (data as unknown as { data: Pipeline[] })?.data ?? [];
    },
  });
}

export function useStages(pipelineId?: string) {
  return useQuery({
    queryKey: ["stages", pipelineId],
    enabled: !!pipelineId,
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/pipelines/{pipeline_id}/stages", {
        params: { path: { pipeline_id: pipelineId as string } },
        headers: headers(),
      });
      if (error) throw error;
      return (data as unknown as Stage[]) ?? [];
    },
  });
}
