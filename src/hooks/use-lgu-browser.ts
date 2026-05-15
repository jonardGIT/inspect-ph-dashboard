"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createLgu, archiveLgu, listLgus } from "@/lib/api/lgus";

export function useLguBrowser(input: {
  accessToken: string;
  page: number;
  search?: string;
}) {
  const queryClient = useQueryClient();
  const enabled = Boolean(input.accessToken);

  const lgusQuery = useQuery({
    queryKey: ["lgu-browser", input.page, input.search],
    queryFn: () =>
      listLgus({
        accessToken: input.accessToken,
        limit: 10,
        page: input.page,
        search: input.search,
      }),
    enabled,
  });

  const createLguMutation = useMutation({
    mutationFn: createLgu,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lgu-browser"] });
    },
  });

  const archiveLguMutation = useMutation({
    mutationFn: archiveLgu,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lgu-browser"] });
    },
  });

  return {
    archiveLguMutation,
    createLguMutation,
    lgusQuery,
  };
}
