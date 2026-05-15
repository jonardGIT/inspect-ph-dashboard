import type {
  ApiListResponse,
  ApiResponse,
  LguRecord,
} from "@shared/types/api";

import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function listLgus(input: {
  accessToken: string;
  limit?: number;
  page?: number;
  search?: string;
}): Promise<ApiListResponse<LguRecord>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<LguRecord>>(
    `${API_V1}/lgus`,
    {
      params: {
        ...(input.limit ? { limit: input.limit } : {}),
        ...(input.page ? { page: input.page } : {}),
        ...(input.search ? { search: input.search } : {}),
      },
    },
  );

  return response.data;
}

export async function createLgu(input: {
  accessToken: string;
  city?: string;
  code: string;
  name: string;
  province?: string;
  region?: string;
}): Promise<LguRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<LguRecord>>(`${API_V1}/lgus`, {
    city: input.city,
    code: input.code,
    name: input.name,
    province: input.province,
    region: input.region,
  });

  return response.data.data;
}

export async function archiveLgu(input: {
  accessToken: string;
  id: string;
}): Promise<void> {
  const client = createApiClient(input.accessToken);
  await client.patch(`${API_V1}/lgus/${input.id}/archive`);
}
