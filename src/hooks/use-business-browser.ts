"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createBusiness, listBusinesses } from "@/lib/api/businesses";

export function useBusinessBrowser(input: {
  accessToken: string;
  barangay?: string;
  city?: string;
  page: number;
  search?: string;
}) {
  const queryClient = useQueryClient();
  const enabled = Boolean(input.accessToken);
  const queryKey = [
    "business-browser",
    input.page,
    input.search,
    input.city,
    input.barangay,
  ];

  const businessesQuery = useQuery({
    queryKey,
    queryFn: () =>
      listBusinesses({
        accessToken: input.accessToken,
        barangay: input.barangay,
        city: input.city,
        limit: 10,
        page: input.page,
        search: input.search,
      }),
    enabled,
  });

  const createBusinessMutation = useMutation({
    mutationFn: createBusiness,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["business-browser"] });
    },
  });

  return {
    businessesQuery,
    createBusinessMutation,
  };
}
