import type {
  BusinessNameMatch,
  DisasterAlert,
  NationalVerificationHistoryItem,
  NationalVerificationKind,
  PcnVerifyResult,
  TinVerifyResult,
} from "@/types";

import { apiClient } from "./client";

export async function verifyPhilSysPcn(input: {
  assertedName: string;
  businessId?: string;
  pcn: string;
}): Promise<PcnVerifyResult> {
  const res = await apiClient.post<{ data: PcnVerifyResult }>(
    "/national/verify-pcn",
    input,
  );
  return res.data.data;
}

export async function verifyBirTin(input: {
  assertedBusinessName: string;
  businessId?: string;
  tin: string;
}): Promise<TinVerifyResult> {
  const res = await apiClient.post<{ data: TinVerifyResult }>(
    "/national/verify-tin",
    input,
  );
  return res.data.data;
}

export async function lookupBusinessName(
  q: string,
  type?: "ALL" | "DTI" | "SEC",
): Promise<BusinessNameMatch[]> {
  const res = await apiClient.get<{ data: BusinessNameMatch[] }>(
    "/national/business-lookup",
    { params: { q, type } },
  );
  return res.data.data;
}

export async function getDisasterAlerts(
  region?: string,
): Promise<DisasterAlert[]> {
  const res = await apiClient.get<{ data: DisasterAlert[] }>(
    "/national/disaster-alerts",
    { params: region ? { region } : undefined },
  );
  return res.data.data;
}

export async function listVerificationHistory(params?: {
  businessId?: string;
  kind?: NationalVerificationKind;
  limit?: number;
  page?: number;
}): Promise<{
  data: NationalVerificationHistoryItem[];
  meta: { limit: number; page: number; total: number };
}> {
  const res = await apiClient.get<{
    data: NationalVerificationHistoryItem[];
    meta: { limit: number; page: number; total: number };
  }>("/national/verifications", { params });
  return res.data;
}
