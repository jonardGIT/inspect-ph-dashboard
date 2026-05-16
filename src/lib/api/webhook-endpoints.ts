import type {
  ApiResponse,
  WebhookEndpoint,
  OutboundWebhookEvent,
} from "@shared/types/api";
import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function listWebhookEndpoints(input: {
  accessToken: string;
}): Promise<WebhookEndpoint[]> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<WebhookEndpoint[]>>(
    `${API_V1}/webhook-endpoints`,
  );
  return response.data.data;
}

export async function createWebhookEndpoint(input: {
  accessToken: string;
  url: string;
  secret: string;
  events: OutboundWebhookEvent[];
}): Promise<WebhookEndpoint> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<WebhookEndpoint>>(
    `${API_V1}/webhook-endpoints`,
    { url: input.url, secret: input.secret, events: input.events },
  );
  return response.data.data;
}

export async function deleteWebhookEndpoint(input: {
  accessToken: string;
  id: string;
}): Promise<void> {
  const client = createApiClient(input.accessToken);
  await client.delete(`${API_V1}/webhook-endpoints/${input.id}`);
}
