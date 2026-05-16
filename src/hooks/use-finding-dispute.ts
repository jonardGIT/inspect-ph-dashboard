import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "@/hooks/use-auth-session";
import {
  getFindingDispute,
  resolveFindingDispute,
  submitFindingDispute,
} from "@/lib/api/finding-disputes";

export function useFindingDispute(findingId: string) {
  const { accessToken } = useAuthSession();
  const queryClient = useQueryClient();
  const queryKey = ["finding-dispute", findingId];

  const query = useQuery({
    enabled: !!accessToken && !!findingId,
    queryFn: () => getFindingDispute({ accessToken, findingId }),
    queryKey,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: (reason: string) =>
      submitFindingDispute({
        accessToken,
        findingId,
        reason,
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey }),
  });

  const resolveMutation = useMutation({
    mutationFn: (input: {
      status: "REVIEWING" | "UPHELD" | "OVERTURNED";
      resolution?: string;
    }) =>
      resolveFindingDispute({
        accessToken,
        findingId,
        resolution: input.resolution,
        status: input.status,
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey }),
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    resolveMutation,
    submitMutation,
  };
}
