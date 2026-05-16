import type { RecognitionRequest, RecognitionVerifyResult } from "@/types";

import { apiClient } from "./client";

export interface ListRecognitionRequestsParams {
  limit?: number;
  page?: number;
  role?: "requesting" | "issuing" | "both";
  status?: string;
}

export async function listRecognitionRequests(
  params: ListRecognitionRequestsParams = {},
): Promise<{
  data: RecognitionRequest[];
  meta: { total: number; page: number; limit: number };
}> {
  const res = await apiClient.get<{
    data: RecognitionRequest[];
    meta: { total: number; page: number; limit: number };
  }>("/mutual-recognition/requests", { params });
  return res.data;
}

export async function createRecognitionRequest(
  certificateNumber: string,
): Promise<RecognitionRequest> {
  const res = await apiClient.post<{ data: RecognitionRequest }>(
    "/mutual-recognition/requests",
    { certificateNumber },
  );
  return res.data.data;
}

export async function getRecognitionRequest(
  id: string,
): Promise<RecognitionRequest> {
  const res = await apiClient.get<{ data: RecognitionRequest }>(
    `/mutual-recognition/requests/${encodeURIComponent(id)}`,
  );
  return res.data.data;
}

export async function respondToConsent(
  id: string,
  decision: "grant" | "deny",
): Promise<RecognitionRequest> {
  const res = await apiClient.post<{ data: RecognitionRequest }>(
    `/mutual-recognition/requests/${encodeURIComponent(id)}/consent`,
    { decision },
  );
  return res.data.data;
}

export async function resolveRecognitionRequest(
  id: string,
  decision: "approve" | "reject",
): Promise<RecognitionRequest> {
  const res = await apiClient.post<{ data: RecognitionRequest }>(
    `/mutual-recognition/requests/${encodeURIComponent(id)}/resolve`,
    { decision },
  );
  return res.data.data;
}

export async function listPendingConsentRequests(): Promise<
  RecognitionRequest[]
> {
  const res = await apiClient.get<{ data: RecognitionRequest[] }>(
    "/mutual-recognition/pending-consent",
  );
  return res.data.data;
}

export async function verifyRecognitionPayload(
  signedPayload: string,
  signature: string,
): Promise<RecognitionVerifyResult> {
  const res = await apiClient.post<{ data: RecognitionVerifyResult }>(
    "/mutual-recognition/verify",
    { signedPayload, signature },
  );
  return res.data.data;
}
