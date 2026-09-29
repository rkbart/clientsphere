import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/auth/me");
      if (error) throw error;
      return data;
    },
    retry: false,
  });
}
