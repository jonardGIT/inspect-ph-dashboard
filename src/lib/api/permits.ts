import type {
  ApiListResponse,
  ApiResponse,
  PermitRecord,
} from "@shared/types/api";

import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function listPermits(input: {
  accessToken: string;
  businessId?: string;
  limit?: number;
  page?: number;
  status?: PermitRecord["status"];
}): Promise<ApiListResponse<PermitRecord>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<PermitRecord>>(
    `${API_V1}/permits`,
    {
      params: {
        ...(input.businessId ? { businessId: input.businessId } : {}),
        ...(input.limit ? { limit: input.limit } : {}),
        ...(input.page ? { page: input.page } : {}),
        ...(input.status ? { status: input.status } : {}),
      },
    },
  );

  return response.data;
}

export async function createPermit(input: {
  accessToken: string;
  applicationDate: string;
  businessId: string;
  expirationDate: string;
  lineOfBusiness: string;
  permitNumber: string;
}): Promise<PermitRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<PermitRecord>>(
    `${API_V1}/permits`,
    {
      applicationDate: input.applicationDate,
      businessId: input.businessId,
      expirationDate: input.expirationDate,
      lineOfBusiness: input.lineOfBusiness,
      permitNumber: input.permitNumber,
    },
  );

  return response.data.data;
}
