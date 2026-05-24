"use client";

import { useQuery } from "@tanstack/react-query";

import { listModules } from "@/lib/api/modules";
import { getInspectionTwinReport } from "@/lib/api/reports";
import { useAuthSession } from "./use-auth-session";

export interface InspectionTwinReportFilters {
  failOnCriticalSeverity: boolean;
  failOnHighSeverity: boolean;
  fromDate?: string;
  lguId?: string;
  maxFailedChecklistItems: number;
  minChecklistPassRatePct: number;
  moduleCode?: string;
  officeId?: string;
  toDate?: string;
}

export function useInspectionTwinReport(filters: InspectionTwinReportFilters) {
  const { accessToken } = useAuthSession();

  const reportQuery = useQuery({
    enabled: Boolean(accessToken),
    queryFn: () =>
      getInspectionTwinReport({
        accessToken: accessToken!,
        ...filters,
      }),
    queryKey: ["inspection-twin-report", filters],
  });

  const modulesQuery = useQuery({
    enabled: Boolean(accessToken),
    queryFn: () =>
      listModules({
        accessToken: accessToken!,
        isActive: true,
        limit: 100,
        page: 1,
      }),
    queryKey: ["inspection-twin-report-modules"],
    staleTime: 5 * 60_000,
  });

  return { modulesQuery, reportQuery };
}
