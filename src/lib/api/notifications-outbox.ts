import type {
  ApiListResponse,
  ApiResponse,
  NotificationOutboxRecord,
} from "@shared/types/api";

import { createApiClient } from "@/lib/api/http";

const API_V1 = "/api/v1";

export async function listNotificationOutbox(input: {
  accessToken: string;
  eventType?: NotificationOutboxRecord["eventType"];
  limit?: number;
  page?: number;
  search?: string;
  status?: NotificationOutboxRecord["status"];
}) {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<NotificationOutboxRecord>>(
    `${API_V1}/notifications/outbox`,
    {
      params: {
        eventType: input.eventType,
        limit: input.limit ?? 10,
        page: input.page ?? 1,
        search: input.search,
        status: input.status,
      },
    },
  );

  return response.data;
}

export async function updateNotificationOutboxStatus(input: {
  accessToken: string;
  id: string;
  status: NotificationOutboxRecord["status"];
}) {
  const client = createApiClient(input.accessToken);
  const response = await client.patch<ApiResponse<NotificationOutboxRecord>>(
    `${API_V1}/notifications/outbox/${input.id}/status`,
    {
      status: input.status,
    },
  );

  return response.data.data;
}
