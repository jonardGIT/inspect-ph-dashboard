import axios from "axios";
import type {
  ApiListResponse,
  ApiResponse,
  FireSafetyCertificateRecord,
  PublicFireSafetyCertificateLookupRecord,
} from "@shared/types/api";

import { createApiClient, getApiOrigin } from "./http";

const API_V1 = "/api/v1";

export async function listFireSafetyCertificates(input: {
  accessToken: string;
  limit?: number;
  officeId?: string;
  page?: number;
  status?: FireSafetyCertificateRecord["status"];
}): Promise<ApiListResponse<FireSafetyCertificateRecord>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<
    ApiListResponse<FireSafetyCertificateRecord>
  >(`${API_V1}/fire-safety-certificates`, {
    params: {
      ...(input.limit ? { limit: input.limit } : {}),
      ...(input.officeId ? { officeId: input.officeId } : {}),
      ...(input.page ? { page: input.page } : {}),
      ...(input.status ? { status: input.status } : {}),
    },
  });

  return response.data;
}

export async function getFireSafetyCertificateByInspection(input: {
  accessToken: string;
  inspectionId: string;
}): Promise<FireSafetyCertificateRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<FireSafetyCertificateRecord>>(
    `${API_V1}/fire-safety-certificates/inspection/${input.inspectionId}`,
  );

  return response.data.data;
}

export async function getPublicFireSafetyCertificateByNumber(input: {
  certificateNumber: string;
}): Promise<PublicFireSafetyCertificateLookupRecord> {
  const response = await axios.get<
    ApiResponse<PublicFireSafetyCertificateLookupRecord>
  >(
    `${getApiOrigin()}${API_V1}/fire-safety-certificates/public/${encodeURIComponent(input.certificateNumber)}`,
  );

  return response.data.data;
}

export function getCertificatePrintUrl(certificateId: string): string {
  return `${getApiOrigin()}${API_V1}/fire-safety-certificates/${certificateId}/print`;
}
