import type {
  ApiListResponse,
  ApiResponse,
  MarketplaceTemplate,
  TemplateRating,
} from "@shared/types/api";
import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function listMarketplaceTemplates(input: {
  accessToken: string;
  limit?: number;
  module?: string;
  page?: number;
  search?: string;
}): Promise<{
  data: MarketplaceTemplate[];
  meta: { limit: number; page: number; total: number };
}> {
  const client = createApiClient(input.accessToken);
  const params: Record<string, string | number> = {};
  if (input.page) params["page"] = input.page;
  if (input.limit) params["limit"] = input.limit;
  if (input.module) params["module"] = input.module;
  if (input.search) params["search"] = input.search;

  const response = await client.get<ApiListResponse<MarketplaceTemplate>>(
    `${API_V1}/checklist-templates/marketplace`,
    { params },
  );
  return { data: response.data.data, meta: response.data.meta };
}

export async function forkTemplate(input: {
  accessToken: string;
  templateId: string;
}): Promise<MarketplaceTemplate> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<MarketplaceTemplate>>(
    `${API_V1}/checklist-templates/${input.templateId}/fork`,
  );
  return response.data.data;
}

export async function publishTemplate(input: {
  accessToken: string;
  templateId: string;
}): Promise<MarketplaceTemplate> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<MarketplaceTemplate>>(
    `${API_V1}/checklist-templates/${input.templateId}/publish`,
  );
  return response.data.data;
}

export async function promoteTemplate(input: {
  accessToken: string;
  templateId: string;
}): Promise<MarketplaceTemplate> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<MarketplaceTemplate>>(
    `${API_V1}/checklist-templates/${input.templateId}/promote`,
  );
  return response.data.data;
}

export async function rateTemplate(input: {
  accessToken: string;
  comment?: string;
  rating: number;
  templateId: string;
}): Promise<TemplateRating> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<TemplateRating>>(
    `${API_V1}/checklist-templates/${input.templateId}/rate`,
    { rating: input.rating, comment: input.comment },
  );
  return response.data.data;
}
