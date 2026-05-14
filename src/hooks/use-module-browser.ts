"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createModule, listModules } from "@/lib/api/modules";

export function useModuleBrowser(input: {
  accessToken: string;
  isActive?: boolean;
  page: number;
  search?: string;
}) {
  const queryClient = useQueryClient();
  const enabled = Boolean(input.accessToken);

  const modulesQuery = useQuery({
    queryKey: ["module-browser", input.page, input.search, input.isActive],
    queryFn: () =>
      listModules({
        accessToken: input.accessToken,
        isActive: input.isActive,
        limit: 10,
        page: input.page,
        search: input.search,
      }),
    enabled,
  });

  const createModuleMutation = useMutation({
    mutationFn: createModule,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["module-browser"] });
    },
  });

  return { createModuleMutation, modulesQuery };
}
