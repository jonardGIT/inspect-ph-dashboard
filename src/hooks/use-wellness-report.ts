"use client";

import { useQuery } from "@tanstack/react-query";

import { getWellnessReport } from "@/lib/api/reports";
import { useAuthSession } from "./use-auth-session";

export interface WellnessReportFilters {
  fromDate?: string;
  toDate?: string;
  lguId?: string;
}

export function useWellnessReport(filters: WellnessReportFilters = {}) {
  const { accessToken } = useAuthSession();

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: () =>
      getWellnessReport({
        accessToken: accessToken!,
        fromDate: filters.fromDate,
        lguId: filters.lguId,
        toDate: filters.toDate,
      }),
    queryKey: ["wellness-report", filters],
  });
}
