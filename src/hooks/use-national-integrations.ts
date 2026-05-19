"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import type { NationalVerificationKind } from "@/types";
import {
  getDisasterAlerts,
  listVerificationHistory,
  lookupBusinessName,
  verifyBirTin,
  verifyPhilSysPcn,
} from "@/lib/api/national-integrations";

export function useVerifyPhilSysPcn() {
  return useMutation({
    mutationFn: (input: {
      assertedName: string;
      businessId?: string;
      pcn: string;
    }) => verifyPhilSysPcn(input),
  });
}

export function useVerifyBirTin() {
  return useMutation({
    mutationFn: (input: {
      assertedBusinessName: string;
      businessId?: string;
      tin: string;
    }) => verifyBirTin(input),
  });
}

export function useLookupBusinessName() {
  return useMutation({
    mutationFn: ({
      q,
      type,
    }: {
      q: string;
      type?: "ALL" | "DTI" | "SEC";
    }) => lookupBusinessName(q, type),
  });
}

export function useDisasterAlerts(region?: string) {
  return useQuery({
    queryFn: () => getDisasterAlerts(region),
    queryKey: ["national", "disaster-alerts", region],
    staleTime: 5 * 60_000,
  });
}

export function useVerificationHistory(params?: {
  businessId?: string;
  kind?: NationalVerificationKind;
  limit?: number;
  page?: number;
}) {
  return useQuery({
    queryFn: () => listVerificationHistory(params),
    queryKey: ["national", "verifications", params],
    staleTime: 30_000,
  });
}
