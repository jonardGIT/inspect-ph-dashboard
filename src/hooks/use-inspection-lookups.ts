"use client";

import { useQuery } from "@tanstack/react-query";
import { useDeferredValue } from "react";

import { listUsers } from "@/lib/api/auth";
import { listBusinesses } from "@/lib/api/businesses";
import { listPermits } from "@/lib/api/permits";

export function useInspectionLookups(input: {
  accessToken: string;
  businessSearch?: string;
  canListInspectors?: boolean;
  inspectorSearch?: string;
  permitBusinessId?: string;
  selectedBusinessId?: string;
  selectedInspectorId?: string;
}) {
  const deferredBusinessSearch = useDeferredValue(
    input.businessSearch?.trim() || input.selectedBusinessId?.trim() || "",
  );
  const deferredInspectorSearch = useDeferredValue(
    input.inspectorSearch?.trim() || input.selectedInspectorId?.trim() || "",
  );
  const enabled = Boolean(input.accessToken);

  const businessesQuery = useQuery({
    queryKey: ["inspection-lookup-businesses", deferredBusinessSearch],
    queryFn: () =>
      listBusinesses({
        accessToken: input.accessToken,
        limit: 10,
        page: 1,
        search: deferredBusinessSearch || undefined,
      }),
    enabled,
  });

  const inspectorsQuery = useQuery({
    queryKey: ["inspection-lookup-inspectors", deferredInspectorSearch],
    queryFn: () =>
      listUsers({
        accessToken: input.accessToken,
        limit: 10,
        page: 1,
        role: "inspector",
        search: deferredInspectorSearch || undefined,
      }),
    enabled: enabled && Boolean(input.canListInspectors),
  });

  const permitsQuery = useQuery({
    queryKey: ["inspection-lookup-permits", input.permitBusinessId],
    queryFn: () =>
      listPermits({
        accessToken: input.accessToken,
        businessId: input.permitBusinessId,
        limit: 100,
        page: 1,
      }),
    enabled: enabled && Boolean(input.permitBusinessId),
  });

  return {
    businessesQuery,
    inspectorsQuery,
    permitsQuery,
  };
}
