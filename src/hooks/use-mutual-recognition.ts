"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createRecognitionRequest,
  listPendingConsentRequests,
  listRecognitionRequests,
  type ListRecognitionRequestsParams,
  resolveRecognitionRequest,
  respondToConsent,
  verifyRecognitionPayload,
} from "@/lib/api/mutual-recognition";

const REQUESTS_KEY = ["mutual-recognition", "requests"] as const;
const PENDING_CONSENT_KEY = ["mutual-recognition", "pending-consent"] as const;

export function useRecognitionRequests(
  params: ListRecognitionRequestsParams = {},
) {
  return useQuery({
    queryFn: () => listRecognitionRequests(params),
    queryKey: [...REQUESTS_KEY, params],
    staleTime: 30_000,
  });
}

export function useCreateRecognitionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (certificateNumber: string) =>
      createRecognitionRequest(certificateNumber),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
    },
  });
}

export function useRespondToConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      decision,
      id,
    }: {
      decision: "grant" | "deny";
      id: string;
    }) => respondToConsent(id, decision),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
      void queryClient.invalidateQueries({ queryKey: PENDING_CONSENT_KEY });
    },
  });
}

export function useResolveRecognitionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      decision,
      id,
    }: {
      decision: "approve" | "reject";
      id: string;
    }) => resolveRecognitionRequest(id, decision),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
    },
  });
}

export function usePendingConsentRequests() {
  return useQuery({
    queryFn: listPendingConsentRequests,
    queryKey: PENDING_CONSENT_KEY,
    staleTime: 30_000,
  });
}

export function useVerifyRecognitionPayload() {
  return useMutation({
    mutationFn: ({
      signature,
      signedPayload,
    }: {
      signature: string;
      signedPayload: string;
    }) => verifyRecognitionPayload(signedPayload, signature),
  });
}
