import axios from "axios";

import type {
  ApiListResponse,
  ApiResponse,
  CreatePublicIssueReportInput,
  IssueReportRecord,
} from "@shared/types/api";

import { createApiClient, getApiOrigin } from "./http";

const API_V1 = "/api/v1";

export async function createPublicIssueReport(
  input: CreatePublicIssueReportInput,
): Promise<IssueReportRecord> {
  const response = await axios.post<ApiResponse<IssueReportRecord>>(
    `${getApiOrigin()}${API_V1}/issue-reports/public`,
    input,
  );

  return response.data.data;
}

export async function getPublicIssueReportByNumber(
  reportNumber: string,
): Promise<IssueReportRecord> {
  const response = await axios.get<ApiResponse<IssueReportRecord>>(
    `${getApiOrigin()}${API_V1}/issue-reports/public/${encodeURIComponent(reportNumber)}`,
  );

  return response.data.data;
}

export async function updateIssueReportStatus(input: {
  accessToken: string;
  id: string;
  status: IssueReportRecord["status"];
}): Promise<IssueReportRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.patch<ApiResponse<IssueReportRecord>>(
    `${API_V1}/issue-reports/${input.id}/status`,
    { status: input.status },
  );

  return response.data.data;
}

export async function listIssueReports(input: {
  accessToken: string;
  category?: IssueReportRecord["category"];
  limit?: number;
  page?: number;
  search?: string;
  status?: IssueReportRecord["status"];
}): Promise<ApiListResponse<IssueReportRecord>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<IssueReportRecord>>(
    `${API_V1}/issue-reports`,
    {
      params: {
        ...(input.category ? { category: input.category } : {}),
        ...(input.limit ? { limit: input.limit } : {}),
        ...(input.page ? { page: input.page } : {}),
        ...(input.search ? { search: input.search } : {}),
        ...(input.status ? { status: input.status } : {}),
      },
    },
  );

  return response.data;
}