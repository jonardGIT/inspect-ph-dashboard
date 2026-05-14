"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createInspection,
  getInspectionSummary,
  listInspectionMapPoints,
  listInspections,
} from "@/lib/api/inspections";

export function useInspectionBrowser(input: {
  accessToken: string;
  businessId?: string;
  from?: string;
  inspectorId?: string;
  lguId?: string;
  officeId?: string;
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
      input.lguId,
      input.officeId,
    ],
    queryFn: () =>
      listInspections({
        accessToken: input.accessToken,
        businessId: input.businessId,
        inspectorId: input.inspectorId,
        limit: 10,
        lguId: input.lguId,
        officeId: input.officeId,
        page: input.page,
        status: input.status,
      }),
    enabled,
  });

  const summaryQuery = useQuery({
    queryKey: ["inspections-summary", input.from, input.to, input.lguId],
    queryFn: () =>
      getInspectionSummary({
        accessToken: input.accessToken,
        from: input.from,
        lguId: input.lguId,
        to: input.to,
      }),
    enabled,
  });

  const createInspectionMutation = useMutation({
    mutationFn: (payload: {
      businessId: string;
      officeId: string;
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

  const mapPointsQuery = useQuery({
    queryKey: [
      "inspections-map-points",
      input.from,
      input.to,
      input.status,
      input.lguId,
      input.officeId,
    ],
    queryFn: () =>
      listInspectionMapPoints({
        accessToken: input.accessToken,
        from: input.from,
        lguId: input.lguId,
        officeId: input.officeId,
        status: input.status,
        to: input.to,
      }),
    enabled,
  });

  return {
    createInspectionMutation,
    inspectionsQuery,
    mapPointsQuery,
    summaryQuery,
  };
}
