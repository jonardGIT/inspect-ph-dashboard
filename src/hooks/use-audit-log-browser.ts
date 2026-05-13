"use client";

import { useQuery } from "@tanstack/react-query";
import type { AuditLogRecord } from "@shared/types/api";

import { listAuditLogs } from "@/lib/api/audit-logs";

export function useAuditLogBrowser(input: {
  accessToken: string;
  action?: AuditLogRecord["action"];
  enabled?: boolean;
  entityType?: AuditLogRecord["entityType"];
  page: number;
  search?: string;
}) {
  return {
    auditLogsQuery: useQuery({
      enabled: input.enabled ?? Boolean(input.accessToken),
      queryKey: [
        "audit-log-browser",
        input.page,
        input.action,
        input.entityType,
        input.search,
      ],
      queryFn: () =>
        listAuditLogs({
          accessToken: input.accessToken,
          action: input.action,
          entityType: input.entityType,
          page: input.page,
          search: input.search,
        }),
    }),
  };
}