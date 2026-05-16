import type {
  ApiListResponse,
  ApiResponse,
  ChecklistTemplateRecord,
} from "@shared/types/api";

import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function listChecklistTemplates(input: {
  accessToken: string;
  isActive?: boolean;
  limit?: number;
  module?: string;
  page?: number;
  search?: string;
}): Promise<ApiListResponse<ChecklistTemplateRecord>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<
    ApiListResponse<ChecklistTemplateRecord>
  >(`${API_V1}/checklist-templates`, {
    params: {
      ...(typeof input.isActive === "boolean"
        ? { isActive: input.isActive }
        : {}),
      ...(input.limit ? { limit: input.limit } : {}),
      ...(input.module ? { module: input.module } : {}),
      ...(input.page ? { page: input.page } : {}),
      ...(input.search ? { search: input.search } : {}),
    },
  });

  return response.data;
}

export async function createChecklistTemplate(input: {
  accessToken: string;
  code: string;
  description?: string;
  isActive?: boolean;
  module: string;
  sortOrder?: number;
  title: string;
}): Promise<ChecklistTemplateRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<ChecklistTemplateRecord>>(
    `${API_V1}/checklist-templates`,
    {
      code: input.code,
      description: input.description,
      isActive: input.isActive,
      module: input.module,
      sortOrder: input.sortOrder,
      title: input.title,
    },
  );

  return response.data.data;
}

export async function patchChecklistTemplateActive(input: {
  accessToken: string;
  id: string;
  isActive: boolean;
}): Promise<ChecklistTemplateRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.patch<ApiResponse<ChecklistTemplateRecord>>(
    `${API_V1}/checklist-templates/${input.id}/active`,
    { isActive: input.isActive },
  );

  return response.data.data;
}

export async function updateChecklistTemplate(input: {
  accessToken: string;
  id: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  title?: string;
}): Promise<ChecklistTemplateRecord> {
  const { accessToken, id, ...fields } = input;
  const client = createApiClient(accessToken);
  const response = await client.patch<ApiResponse<ChecklistTemplateRecord>>(
    `${API_V1}/checklist-templates/${id}`,
    fields,
  );

  return response.data.data;
}
