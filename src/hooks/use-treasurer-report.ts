"use client";

import { useQuery } from "@tanstack/react-query";

import { getTreasurerReport } from "@/lib/api/reports";
import { useAuthSession } from "./use-auth-session";

export interface TreasurerReportFilters {
  fromDate?: string;
  toDate?: string;
  officeId?: string;
  lguId?: string;
}

export function useTreasurerReport(filters: TreasurerReportFilters = {}) {
  const { accessToken } = useAuthSession();

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: () =>
      getTreasurerReport({
        accessToken: accessToken!,
        fromDate: filters.fromDate,
        lguId: filters.lguId,
        officeId: filters.officeId,
        toDate: filters.toDate,
      }),
    queryKey: ["treasurer-report", filters],
  });
}
