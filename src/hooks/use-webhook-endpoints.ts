"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "@/hooks/use-auth-session";
import {
  createWebhookEndpoint,
  deleteWebhookEndpoint,
  listWebhookEndpoints,
} from "@/lib/api/webhook-endpoints";
import type { OutboundWebhookEvent } from "@shared/types/api";

export function useWebhookEndpoints() {
  const { accessToken } = useAuthSession();
  return useQuery({
    enabled: !!accessToken,
    queryKey: ["webhook-endpoints"],
    queryFn: () => listWebhookEndpoints({ accessToken: accessToken! }),
    staleTime: 60_000,
  });
}

export function useCreateWebhookEndpoint() {
  const { accessToken } = useAuthSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      url: string;
      secret: string;
      events: OutboundWebhookEvent[];
    }) => createWebhookEndpoint({ accessToken: accessToken!, ...input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["webhook-endpoints"] });
    },
  });
}

export function useDeleteWebhookEndpoint() {
  const { accessToken } = useAuthSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      deleteWebhookEndpoint({ accessToken: accessToken!, id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["webhook-endpoints"] });
    },
  });
}
