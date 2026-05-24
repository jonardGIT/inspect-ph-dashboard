import axios from "axios";
import type {
  ApiResponse,
  CertificateVerificationResult,
} from "@shared/types/api";

import { createApiClient, getApiOrigin } from "./http";

const API_V1 = "/api/v1";

export async function getPublicCertificateVerification(input: {
  verificationToken: string;
}): Promise<CertificateVerificationResult> {
  const response = await axios.get<ApiResponse<CertificateVerificationResult>>(
    `${getApiOrigin()}${API_V1}/fire-safety-certificates/public/verify/${encodeURIComponent(input.verificationToken)}`,
  );

  return response.data.data;
}

export async function createFireSafetyCertificate(input: {
  accessToken: string;
  inspectionId: string;
  issuedAt: string;
  expiresAt: string;
  remarks?: string;
}) {
  const client = createApiClient(input.accessToken);
  const response = await client.post(`${API_V1}/fire-safety-certificates`, {
    expiresAt: input.expiresAt,
    inspectionId: input.inspectionId,
    issuedAt: input.issuedAt,
    remarks: input.remarks,
  });

  return response.data.data;
}
