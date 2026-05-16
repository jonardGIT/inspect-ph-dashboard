"use client";

import { useQuery } from "@tanstack/react-query";

import { getComplianceScore } from "@/lib/api/businesses";
import { useAuthSession } from "./use-auth-session";

export function useComplianceScore(businessId: string | null) {
  const { accessToken } = useAuthSession();

  return useQuery({
    enabled: Boolean(accessToken) && Boolean(businessId),
    queryFn: () =>
      getComplianceScore({
        accessToken: accessToken!,
        businessId: businessId!,
      }),
    queryKey: ["compliance-score", businessId],
    staleTime: 5 * 60 * 1000, // 5 min — expensive aggregation
  });
}
