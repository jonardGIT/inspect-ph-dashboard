"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listPaymentAnomalyFlags,
  resolvePaymentAnomalyFlag,
} from "@/lib/api/reports";
import { useAuthSession } from "./use-auth-session";

export interface AnomalyFlagsFilters {
  includeResolved?: boolean;
  lguId?: string;
  page?: number;
  limit?: number;
}

export function usePaymentAnomalyFlags(filters: AnomalyFlagsFilters = {}) {
  const { accessToken } = useAuthSession();

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: () =>
      listPaymentAnomalyFlags({
        accessToken: accessToken!,
        includeResolved: filters.includeResolved,
        lguId: filters.lguId,
        page: filters.page,
        limit: filters.limit,
      }),
    queryKey: ["payment-anomaly-flags", filters],
  });
}

export function useResolveAnomalyFlag() {
  const { accessToken } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flagId: string) =>
      resolvePaymentAnomalyFlag({ accessToken: accessToken!, flagId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["payment-anomaly-flags"],
      });
    },
  });
}
