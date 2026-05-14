import type {
  ApiListResponse,
  ApiResponse,
  ModuleRecord,
} from "@shared/types/api";

import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function listModules(input: {
  accessToken: string;
  isActive?: boolean;
  limit?: number;
  page?: number;
  search?: string;
}): Promise<ApiListResponse<ModuleRecord>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<ModuleRecord>>(
    `${API_V1}/modules`,
    {
      params: {
        ...(typeof input.isActive === "boolean"
          ? { isActive: input.isActive }
          : {}),
        ...(input.limit ? { limit: input.limit } : {}),
        ...(input.page ? { page: input.page } : {}),
        ...(input.search ? { search: input.search } : {}),
      },
    },
  );

  return response.data;
}

export async function createModule(input: {
  accessToken: string;
  code: string;
  description?: string;
  isActive?: boolean;
  name: string;
}): Promise<ModuleRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<ModuleRecord>>(
    `${API_V1}/modules`,
    {
      code: input.code,
      description: input.description,
      isActive: input.isActive,
      name: input.name,
    },
  );

  return response.data.data;
}
