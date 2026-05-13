"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listLgus } from "@/lib/api/lgus";
import { createOffice, listOffices } from "@/lib/api/offices";

export function useOfficeBrowser(input: {
  accessToken: string;
  lguId?: string;
  page: number;
  search?: string;
}) {
  const queryClient = useQueryClient();
  const enabled = Boolean(input.accessToken);

  const officesQuery = useQuery({
    queryKey: ["office-browser", input.page, input.search, input.lguId],
    queryFn: () =>
      listOffices({
        accessToken: input.accessToken,
        lguId: input.lguId,
        limit: 10,
        page: input.page,
        search: input.search,
      }),
    enabled,
  });

  const lguOptionsQuery = useQuery({
    queryKey: ["office-browser-lgus"],
    queryFn: () =>
      listLgus({
        accessToken: input.accessToken,
        limit: 100,
        page: 1,
      }),
    enabled,
  });

  const createOfficeMutation = useMutation({
    mutationFn: createOffice,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["office-browser"] });
    },
  });

  return {
    createOfficeMutation,
    lguOptionsQuery,
    officesQuery,
  };
}
