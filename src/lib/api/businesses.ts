import type {
  ApiListResponse,
  ApiResponse,
  BusinessEstablishment,
} from "@shared/types/api";

import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function listBusinesses(input: {
  accessToken: string;
  barangay?: string;
  city?: string;
  limit?: number;
  page?: number;
  search?: string;
}): Promise<ApiListResponse<BusinessEstablishment>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<BusinessEstablishment>>(
    `${API_V1}/businesses`,
    {
      params: {
        ...(input.barangay ? { barangay: input.barangay } : {}),
        ...(input.city ? { city: input.city } : {}),
        ...(input.limit ? { limit: input.limit } : {}),
        ...(input.page ? { page: input.page } : {}),
        ...(input.search ? { search: input.search } : {}),
      },
    },
  );

  return response.data;
}

export async function createBusiness(input: {
  accessToken: string;
  addressLine: string;
  barangay: string;
  businessName: string;
  city: string;
  contactNumber?: string;
  ownerName: string;
  province: string;
  taxIdentificationNumber?: string;
  tradeName?: string;
}): Promise<BusinessEstablishment> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<BusinessEstablishment>>(
    `${API_V1}/businesses`,
    {
      addressLine: input.addressLine,
      barangay: input.barangay,
      businessName: input.businessName,
      city: input.city,
      contactNumber: input.contactNumber,
      ownerName: input.ownerName,
      province: input.province,
      taxIdentificationNumber: input.taxIdentificationNumber,
      tradeName: input.tradeName,
    },
  );

  return response.data.data;
}
