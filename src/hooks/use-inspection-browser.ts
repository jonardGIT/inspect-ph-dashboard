"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createInspection,
  getInspectionSummary,
  listInspections,
} from "@/lib/api/inspections";

export function useInspectionBrowser(input: {
  accessToken: string;
  businessId?: string;
  from?: string;
  inspectorId?: string;
  page: number;
  status?: "scheduled" | "in_progress" | "completed" | "overdue" | "canceled";
  to?: string;
}) {
  const queryClient = useQueryClient();
  const enabled = Boolean(input.accessToken);

  const inspectionsQuery = useQuery({
    queryKey: [
      "inspections-browser",
      input.page,
      input.status,
      input.businessId,
      input.inspectorId,
    ],
    queryFn: () =>
      listInspections({
        accessToken: input.accessToken,
        businessId: input.businessId,
        inspectorId: input.inspectorId,
        limit: 10,
        page: input.page,
        status: input.status,
      }),
    enabled,
  });

  const summaryQuery = useQuery({
    queryKey: ["inspections-summary", input.from, input.to],
    queryFn: () =>
      getInspectionSummary({
        accessToken: input.accessToken,
        from: input.from,
        to: input.to,
      }),
    enabled,
  });

  const createInspectionMutation = useMutation({
    mutationFn: (payload: {
      businessId: string;
      permitRecordId: string;
      scheduledAt: string;
      inspectorId?: string;
      notes?: string;
    }) =>
      createInspection({
        accessToken: input.accessToken,
        ...payload,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["inspections-browser"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["inspections-summary"],
        }),
      ]);
    },
  });

  return {
    createInspectionMutation,
    inspectionsQuery,
    summaryQuery,
  };
}
