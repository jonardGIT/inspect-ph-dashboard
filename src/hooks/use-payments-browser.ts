"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaymentRecord } from "@shared/types/api";

import { listPayments } from "@/lib/api/payments";

export function usePaymentsBrowser(input: {
  accessToken: string;
  enabled?: boolean;
  page: number;
  provider?: PaymentRecord["provider"];
  status?: PaymentRecord["status"];
}) {
  return {
    paymentsQuery: useQuery({
      enabled: input.enabled ?? Boolean(input.accessToken),
      queryKey: ["payments-browser", input.page, input.provider, input.status],
      queryFn: () =>
        listPayments({
          accessToken: input.accessToken,
          limit: 10,
          page: input.page,
          provider: input.provider,
          status: input.status,
        }),
    }),
  };
}
