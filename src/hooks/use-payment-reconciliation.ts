"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthSession } from "@/hooks/use-auth-session";
import { getPaymentReconciliation } from "@/lib/api/reports";

export function usePaymentReconciliation() {
  const { accessToken } = useAuthSession();
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [officeId, setOfficeId] = useState<string | undefined>();

  const query = useQuery({
    enabled: !!accessToken,
    queryFn: () =>
      getPaymentReconciliation({
        accessToken,
        fromDate,
        officeId,
        toDate,
      }),
    queryKey: ["payment-reconciliation", fromDate, toDate, officeId],
    retry: false,
    staleTime: 60_000,
  });

  return {
    data: query.data,
    error: query.error,
    fromDate,
    isLoading: query.isLoading,
    officeId,
    refetch: query.refetch,
    setFromDate,
    setOfficeId,
    setToDate,
    toDate,
  };
}
