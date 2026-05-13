"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createPermit, listPermits } from "@/lib/api/permits";

export function usePermitBrowser(input: {
  accessToken: string;
  businessId?: string;
  page: number;
  status?: "draft" | "pending_inspection" | "approved" | "rejected" | "expired";
}) {
  const queryClient = useQueryClient();
  const enabled = Boolean(input.accessToken);

  const permitsQuery = useQuery({
    queryKey: ["permit-browser", input.page, input.status, input.businessId],
    queryFn: () =>
      listPermits({
        accessToken: input.accessToken,
        businessId: input.businessId,
        limit: 10,
        page: input.page,
        status: input.status,
      }),
    enabled,
  });

  const createPermitMutation = useMutation({
    mutationFn: createPermit,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["permit-browser"] });
    },
  });

  return {
    createPermitMutation,
    permitsQuery,
  };
}
