import type {
  ApiResponse,
  ProvisionedLgu,
  ProvisionLguInput,
} from "@shared/types/api";

import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function provisionLgu(
  input: ProvisionLguInput & { accessToken: string },
): Promise<ProvisionedLgu> {
  const { accessToken, ...body } = input;
  const client = createApiClient(accessToken);
  const response = await client.post<ApiResponse<ProvisionedLgu>>(
    `${API_V1}/admin/provision-lgu`,
    body,
  );
  return response.data.data;
}
