import type { ApiListResponse, AuditLogRecord } from "@shared/types/api";

import { createApiClient } from "@/lib/api/http";

const API_V1 = "/api/v1";

export async function listAuditLogs(input: {
  accessToken: string;
  action?: AuditLogRecord["action"];
  entityType?: AuditLogRecord["entityType"];
  limit?: number;
  page?: number;
  search?: string;
}) {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<AuditLogRecord>>(
    `${API_V1}/audit-logs`,
    {
      params: {
        action: input.action,
        entityType: input.entityType,
        limit: input.limit ?? 10,
        page: input.page ?? 1,
        search: input.search,
      },
    },
  );

  return response.data;
}
