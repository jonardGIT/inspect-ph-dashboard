import type {
  ApiListResponse,
  ApiResponse,
  OfficeModuleRecord,
} from "@shared/types/api";

import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function listOfficeModules(input: {
  accessToken: string;
  limit?: number;
  moduleId?: string;
  officeId?: string;
  page?: number;
}): Promise<ApiListResponse<OfficeModuleRecord>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<OfficeModuleRecord>>(
    `${API_V1}/office-modules`,
    {
      params: {
        ...(input.limit ? { limit: input.limit } : {}),
        ...(input.moduleId ? { moduleId: input.moduleId } : {}),
        ...(input.officeId ? { officeId: input.officeId } : {}),
        ...(input.page ? { page: input.page } : {}),
      },
    },
  );

  return response.data;
}

export async function createOfficeModule(input: {
  accessToken: string;
  moduleId: string;
  officeId: string;
}): Promise<OfficeModuleRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<OfficeModuleRecord>>(
    `${API_V1}/office-modules`,
    {
      moduleId: input.moduleId,
      officeId: input.officeId,
    },
  );

  return response.data.data;
}

export async function deleteOfficeModule(input: {
  accessToken: string;
  assignmentId: string;
}): Promise<void> {
  const client = createApiClient(input.accessToken);

  await client.delete(`${API_V1}/office-modules/${input.assignmentId}`);
}
