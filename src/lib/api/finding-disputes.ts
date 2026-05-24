import type { ApiResponse, FindingDisputeRecord } from "@shared/types/api";

import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function submitFindingDispute(input: {
  accessToken: string;
  findingId: string;
  reason: string;
}): Promise<FindingDisputeRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<FindingDisputeRecord>>(
    `${API_V1}/findings/${input.findingId}/dispute`,
    { reason: input.reason },
  );

  return response.data.data;
}

export async function getFindingDispute(input: {
  accessToken: string;
  findingId: string;
}): Promise<FindingDisputeRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<FindingDisputeRecord>>(
    `${API_V1}/findings/${input.findingId}/dispute`,
  );

  return response.data.data;
}

export async function resolveFindingDispute(input: {
  accessToken: string;
  findingId: string;
  status: "REVIEWING" | "UPHELD" | "OVERTURNED";
  resolution?: string;
}): Promise<FindingDisputeRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.patch<ApiResponse<FindingDisputeRecord>>(
    `${API_V1}/findings/${input.findingId}/dispute`,
    {
      resolution: input.resolution,
      status: input.status,
    },
  );

  return response.data.data;
}
