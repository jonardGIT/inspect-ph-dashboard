import type {
  ApiListResponse,
  ApiResponse,
  CorrectiveActionPlanRecord,
} from "@shared/types/api";

import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function listCaps(input: {
  accessToken: string;
  businessId?: string;
  inspectionId?: string;
  limit?: number;
  page?: number;
  status?: CorrectiveActionPlanRecord["status"];
}): Promise<ApiListResponse<CorrectiveActionPlanRecord>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<
    ApiListResponse<CorrectiveActionPlanRecord>
  >(`${API_V1}/caps`, {
    params: {
      ...(input.businessId ? { businessId: input.businessId } : {}),
      ...(input.inspectionId ? { inspectionId: input.inspectionId } : {}),
      ...(input.limit ? { limit: input.limit } : {}),
      ...(input.page ? { page: input.page } : {}),
      ...(input.status ? { status: input.status.toUpperCase() } : {}),
    },
  });

  return response.data;
}

export async function listMineCaps(input: {
  accessToken: string;
  limit?: number;
  page?: number;
  status?: CorrectiveActionPlanRecord["status"];
}): Promise<ApiListResponse<CorrectiveActionPlanRecord>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<
    ApiListResponse<CorrectiveActionPlanRecord>
  >(`${API_V1}/caps/mine`, {
    params: {
      ...(input.limit ? { limit: input.limit } : {}),
      ...(input.page ? { page: input.page } : {}),
      ...(input.status ? { status: input.status.toUpperCase() } : {}),
    },
  });

  return response.data;
}

export async function createCap(input: {
  accessToken: string;
  findingId: string;
  description: string;
  deadlineAt?: string;
}): Promise<CorrectiveActionPlanRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<CorrectiveActionPlanRecord>>(
    `${API_V1}/findings/${input.findingId}/cap`,
    {
      description: input.description,
      ...(input.deadlineAt ? { deadlineAt: input.deadlineAt } : {}),
    },
  );

  return response.data.data;
}

export async function updateCapStatus(input: {
  accessToken: string;
  id: string;
  status: CorrectiveActionPlanRecord["status"];
  responseNote?: string;
}): Promise<CorrectiveActionPlanRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.patch<ApiResponse<CorrectiveActionPlanRecord>>(
    `${API_V1}/caps/${input.id}/status`,
    {
      status: input.status.toUpperCase(),
      ...(input.responseNote ? { responseNote: input.responseNote } : {}),
    },
  );

  return response.data.data;
}
