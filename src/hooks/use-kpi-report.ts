"use client";

import { useQuery } from "@tanstack/react-query";

import { getKpiReport } from "@/lib/api/reports";
import { useAuthSession } from "./use-auth-session";

export interface KpiReportFilters {
  fromDate?: string;
  toDate?: string;
  lguId?: string;
  officeId?: string;
}

export function useKpiReport(filters: KpiReportFilters = {}) {
  const { accessToken } = useAuthSession();

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: () =>
      getKpiReport({
        accessToken: accessToken!,
        fromDate: filters.fromDate,
        lguId: filters.lguId,
        officeId: filters.officeId,
        toDate: filters.toDate,
      }),
    queryKey: ["kpi-report", filters],
  });
}
