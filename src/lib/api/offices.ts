import type {
  ApiListResponse,
  ApiResponse,
  OfficeRecord,
} from "@shared/types/api";

import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function listOffices(input: {
  accessToken: string;
  lguId?: string;
  limit?: number;
  page?: number;
  search?: string;
}): Promise<ApiListResponse<OfficeRecord>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<OfficeRecord>>(
    `${API_V1}/offices`,
    {
      params: {
        ...(input.lguId ? { lguId: input.lguId } : {}),
        ...(input.limit ? { limit: input.limit } : {}),
        ...(input.page ? { page: input.page } : {}),
        ...(input.search ? { search: input.search } : {}),
      },
    },
  );

  return response.data;
}

export async function createOffice(input: {
  accessToken: string;
  code: string;
  description?: string;
  lguId: string;
  name: string;
}): Promise<OfficeRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<OfficeRecord>>(
    `${API_V1}/offices`,
    {
      code: input.code,
      description: input.description,
      lguId: input.lguId,
      name: input.name,
    },
  );

  return response.data.data;
}
