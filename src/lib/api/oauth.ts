import type {
  OAuthClientRecord,
  OAuthConsentInfo,
  OAuthTokenResponse,
} from "@/types";

import { apiClient } from "./client";

// Admin: list registered OAuth clients
export async function listOAuthClients(): Promise<OAuthClientRecord[]> {
  const res = await apiClient.get<{ data: OAuthClientRecord[] }>(
    "/oauth/clients",
  );
  return res.data.data;
}

// Admin: register a new client
export interface RegisterClientInput {
  name: string;
  description?: string;
  redirectUri: string;
  scopes: string[];
}

export interface RegisterClientResponse {
  data: OAuthClientRecord;
  clientSecret: string;
  warning: string;
}

export async function registerOAuthClient(
  input: RegisterClientInput,
): Promise<RegisterClientResponse> {
  const res = await apiClient.post<RegisterClientResponse>(
    "/oauth/clients",
    input,
  );
  return res.data;
}

// Admin: delete client
export async function deleteOAuthClient(id: string): Promise<void> {
  await apiClient.delete(`/oauth/clients/${id}`);
}

// Consent page: get client info (no auth needed; uses plain fetch)
export async function getOAuthClientInfo(
  clientId: string,
): Promise<OAuthConsentInfo> {
  const res = await apiClient.get<{ data: OAuthConsentInfo }>(
    `/oauth/clients/${encodeURIComponent(clientId)}/info`,
  );
  return res.data.data;
}

// Business owner grants consent
export async function grantOAuthConsent(payload: {
  accessToken: string;
  client_id: string;
  decision: "approve" | "deny";
  redirect_uri: string;
  scope: string;
  state?: string;
}): Promise<{ redirectUri: string }> {
  const { accessToken, ...body } = payload;
  const res = await apiClient.post<{ data: { redirectUri: string } }>(
    "/oauth/authorize",
    body,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return res.data.data;
}
