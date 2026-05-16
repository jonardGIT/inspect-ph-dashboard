import axios from "axios";

import type {
  ApiListResponse,
  ApiResponse,
  PublicPermitFindingsLookupRecord,
  PublicPermitLookupRecord,
  PermitRecord,
} from "@shared/types/api";

import { createApiClient, getApiOrigin } from "./http";

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

export async function getPublicPermitByNumber(input: {
  permitNumber: string;
}): Promise<PublicPermitLookupRecord> {
  const response = await axios.get<ApiResponse<PublicPermitLookupRecord>>(
    `${getApiOrigin()}${API_V1}/permits/public/${encodeURIComponent(input.permitNumber)}`,
  );

  return response.data.data;
}

export async function getPublicPermitFindingsByNumber(input: {
  permitNumber: string;
}): Promise<PublicPermitFindingsLookupRecord> {
  const response = await axios.get<ApiResponse<PublicPermitFindingsLookupRecord>>(
    `${getApiOrigin()}${API_V1}/permits/public/${encodeURIComponent(input.permitNumber)}/findings`,
  );

  return response.data.data;
}

export async function archivePermit(input: {
  accessToken: string;
  id: string;
}): Promise<void> {
  const client = createApiClient(input.accessToken);
  await client.patch(`${API_V1}/permits/${input.id}/archive`);
}

export async function getPermit(input: {
  accessToken: string;
  id: string;
}): Promise<PermitRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<PermitRecord>>(
    `${API_V1}/permits/${input.id}`,
  );
  return response.data.data;
}

export async function updatePermit(input: {
  accessToken: string;
  id: string;
  applicationDate?: string;
  expirationDate?: string;
  lineOfBusiness?: string;
  permitNumber?: string;
}): Promise<PermitRecord> {
  const { accessToken, id, ...fields } = input;
  const client = createApiClient(accessToken);
  const response = await client.patch<ApiResponse<PermitRecord>>(
    `${API_V1}/permits/${id}`,
    fields,
  );
  return response.data.data;
}
