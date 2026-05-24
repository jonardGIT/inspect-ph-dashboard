"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaymentRecord } from "@shared/types/api";

import { listPayments, reconcilePayment } from "@/lib/api/payments";

export function usePaymentsBrowser(input: {
  accessToken: string;
  enabled?: boolean;
  page: number;
  permitId?: string;
  provider?: PaymentRecord["provider"];
  status?: PaymentRecord["status"];
}) {
  const queryClient = useQueryClient();

  return {
    paymentsQuery: useQuery({
      enabled: input.enabled ?? Boolean(input.accessToken),
      queryKey: [
        "payments-browser",
        input.page,
        input.permitId,
        input.provider,
        input.status,
      ],
      queryFn: () =>
        listPayments({
          accessToken: input.accessToken,
          limit: 10,
          page: input.page,
          permitId: input.permitId,
          provider: input.provider,
          status: input.status,
        }),
    }),
    reconcileMutation: useMutation({
      mutationFn: (payload: {
        note?: string;
        paymentId: string;
        status: "paid" | "failed" | "refunded";
      }) =>
        reconcilePayment({
          accessToken: input.accessToken,
          ...payload,
        }),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["payments-browser"] }),
          queryClient.invalidateQueries({
            queryKey: ["payment-reconciliation"],
          }),
        ]);
      },
    }),
  };
}
