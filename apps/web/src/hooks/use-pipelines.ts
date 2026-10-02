import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

function invalidatePipelineQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["pipelines"] });
  queryClient.invalidateQueries({ queryKey: ["stages"] });
  queryClient.invalidateQueries({ queryKey: ["deals"] });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pipeline: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/pipelines", {
        body: { pipeline: pipeline as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidatePipelineQueries(queryClient),
  });
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...pipeline }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/pipelines/{id}", {
        params: { path: { id: id as string } },
        body: { pipeline: pipeline as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidatePipelineQueries(queryClient),
  });
}

export function useDeletePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient.DELETE("/pipelines/{id}", {
        params: { path: { id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => invalidatePipelineQueries(queryClient),
  });
}

export function useCreateStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pipeline_id, ...stage }: Record<string, unknown>) => {
      const { data, error } = await apiClient.POST("/pipelines/{pipeline_id}/stages", {
        params: { path: { pipeline_id: pipeline_id as string } },
        body: { stage: stage as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidatePipelineQueries(queryClient),
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pipeline_id,
      id,
      ...stage
    }: Record<string, unknown>) => {
      const { data, error } = await apiClient.PATCH("/pipelines/{pipeline_id}/stages/{id}", {
        params: { path: { pipeline_id: pipeline_id as string, id: id as string } },
        body: { stage: stage as never },
        headers: headers(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidatePipelineQueries(queryClient),
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pipeline_id, id }: { pipeline_id: string; id: string }) => {
      const { error } = await apiClient.DELETE("/pipelines/{pipeline_id}/stages/{id}", {
        params: { path: { pipeline_id, id } },
        headers: headers(),
      });
      if (error) throw error;
    },
    onSuccess: () => invalidatePipelineQueries(queryClient),
  });
}
