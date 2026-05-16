"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { archiveBusiness, createBusiness, listBusinesses, updateBusiness } from "@/lib/api/businesses";

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

  const archiveBusinessMutation = useMutation({
    mutationFn: archiveBusiness,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["business-browser"] });
    },
  });

  const updateBusinessMutation = useMutation({
    mutationFn: updateBusiness,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["business-browser"] });
    },
  });

  return {
    archiveBusinessMutation,
    businessesQuery,
    createBusinessMutation,
    updateBusinessMutation,
  };
}
