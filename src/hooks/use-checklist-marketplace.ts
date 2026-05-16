"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "@/hooks/use-auth-session";
import {
  forkTemplate,
  listMarketplaceTemplates,
  promoteTemplate,
  publishTemplate,
  rateTemplate,
} from "@/lib/api/checklist-marketplace";

export function useMarketplaceTemplates(opts?: {
  limit?: number;
  module?: string;
  page?: number;
  search?: string;
}) {
  const { accessToken } = useAuthSession();
  return useQuery({
    enabled: !!accessToken,
    queryFn: () =>
      listMarketplaceTemplates({
        accessToken: accessToken!,
        limit: opts?.limit,
        module: opts?.module,
        page: opts?.page,
        search: opts?.search,
      }),
    queryKey: ["marketplace-templates", opts],
    staleTime: 60_000,
  });
}

export function useForkTemplate() {
  const { accessToken } = useAuthSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      forkTemplate({ accessToken: accessToken!, templateId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["marketplace-templates"],
      });
      void queryClient.invalidateQueries({ queryKey: ["checklist-templates"] });
    },
  });
}

export function usePublishTemplate() {
  const { accessToken } = useAuthSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      publishTemplate({ accessToken: accessToken!, templateId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["marketplace-templates"],
      });
      void queryClient.invalidateQueries({ queryKey: ["checklist-templates"] });
    },
  });
}

export function usePromoteTemplate() {
  const { accessToken } = useAuthSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      promoteTemplate({ accessToken: accessToken!, templateId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["marketplace-templates"],
      });
      void queryClient.invalidateQueries({ queryKey: ["checklist-templates"] });
    },
  });
}

export function useRateTemplate() {
  const { accessToken } = useAuthSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      comment?: string;
      rating: number;
      templateId: string;
    }) => rateTemplate({ accessToken: accessToken!, ...input }),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ["marketplace-templates"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["marketplace-template", vars.templateId],
      });
    },
  });
}
