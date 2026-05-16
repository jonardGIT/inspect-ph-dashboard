"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCap,
  listCaps,
  listMineCaps,
  updateCapStatus,
} from "@/lib/api/corrective-action-plans";
import type { CorrectiveActionPlanRecord } from "@shared/types/api";

export function useCapBrowser(input: {
  accessToken: string;
  isOwner?: boolean;
  businessId?: string;
  inspectionId?: string;
  page: number;
  status?: CorrectiveActionPlanRecord["status"];
}) {
  const queryClient = useQueryClient();
  const enabled = Boolean(input.accessToken);

  const queryFn = input.isOwner
    ? () =>
        listMineCaps({
          accessToken: input.accessToken,
          limit: 20,
          page: input.page,
          status: input.status,
        })
    : () =>
        listCaps({
          accessToken: input.accessToken,
          businessId: input.businessId,
          inspectionId: input.inspectionId,
          limit: 20,
          page: input.page,
          status: input.status,
        });

  const capsQuery = useQuery({
    queryKey: [
      "cap-browser",
      input.isOwner,
      input.page,
      input.status,
      input.businessId,
      input.inspectionId,
    ],
    queryFn,
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: createCap,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cap-browser"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateCapStatus,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cap-browser"] });
    },
  });

  return { capsQuery, createMutation, updateStatusMutation };
}
