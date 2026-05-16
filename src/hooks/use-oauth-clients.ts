"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteOAuthClient,
  listOAuthClients,
  registerOAuthClient,
  type RegisterClientInput,
  type RegisterClientResponse,
} from "@/lib/api/oauth";

const CLIENTS_KEY = ["oauth", "clients"] as const;

export function useOAuthClients() {
  return useQuery({
    queryFn: listOAuthClients,
    queryKey: CLIENTS_KEY,
  });
}

export function useRegisterOAuthClient() {
  const queryClient = useQueryClient();

  return useMutation<RegisterClientResponse, Error, RegisterClientInput>({
    mutationFn: registerOAuthClient,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
    },
  });
}

export function useDeleteOAuthClient() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteOAuthClient,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
    },
  });
}
