import type {
  ApiListResponse,
  ApiResponse,
  CreateDataSubjectRequestInput,
  DataSubjectRequestRecord,
  DataSubjectRequestStatus,
  DataSubjectRequestType,
  UpdateDataSubjectRequestInput,
} from "@shared/types/api";
import axios from "axios";

import { createApiClient, getApiOrigin } from "./http";

const API_V1 = "/api/v1";

// Public — no auth required
export async function submitDataSubjectRequest(
  input: CreateDataSubjectRequestInput,
): Promise<DataSubjectRequestRecord> {
  const response = await axios.post<ApiResponse<DataSubjectRequestRecord>>(
    `${getApiOrigin()}${API_V1}/privacy/requests`,
    input,
  );
  return response.data.data;
}

// Admin only
export async function listDataSubjectRequests(input: {
  accessToken: string;
  limit?: number;
  offset?: number;
  status?: DataSubjectRequestStatus;
  type?: DataSubjectRequestType;
}): Promise<ApiListResponse<DataSubjectRequestRecord>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<DataSubjectRequestRecord>>(
    `${API_V1}/privacy/requests`,
    {
      params: {
        limit: input.limit,
        offset: input.offset,
        status: input.status,
        type: input.type,
      },
    },
  );
  return response.data;
}

export async function getDataSubjectRequest(input: {
  accessToken: string;
  id: string;
}): Promise<DataSubjectRequestRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<DataSubjectRequestRecord>>(
    `${API_V1}/privacy/requests/${input.id}`,
  );
  return response.data.data;
}

export async function updateDataSubjectRequest(input: {
  accessToken: string;
  id: string;
  update: UpdateDataSubjectRequestInput;
}): Promise<DataSubjectRequestRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.patch<ApiResponse<DataSubjectRequestRecord>>(
    `${API_V1}/privacy/requests/${input.id}`,
    input.update,
  );
  return response.data.data;
}
