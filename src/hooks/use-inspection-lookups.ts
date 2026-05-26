"use client";

import { useQuery } from "@tanstack/react-query";
import { useDeferredValue } from "react";

import { listUsers } from "@/lib/api/auth";
import { listBusinesses } from "@/lib/api/businesses";
import { listLgus } from "@/lib/api/lgus";
import { listOffices } from "@/lib/api/offices";
import { listPermits } from "@/lib/api/permits";

export function useInspectionLookups(input: {
  accessToken: string;
  businessSearch?: string;
  canListInspectors?: boolean;
  inspectorSearch?: string;
  lguSearch?: string;
  officeSearch?: string;
  permitBusinessId?: string;
  selectedBusinessId?: string;
  selectedInspectorId?: string;
  selectedLguId?: string;
  selectedOfficeId?: string;
}) {
  const lookupStaleTime = 60_000;
  const deferredBusinessSearch = useDeferredValue(
    input.businessSearch?.trim() || input.selectedBusinessId?.trim() || "",
  );
  const deferredInspectorSearch = useDeferredValue(
    input.inspectorSearch?.trim() || input.selectedInspectorId?.trim() || "",
  );
  const deferredLguSearch = useDeferredValue(
    input.lguSearch?.trim() || input.selectedLguId?.trim() || "",
  );
  const deferredOfficeSearch = useDeferredValue(
    input.officeSearch?.trim() || input.selectedOfficeId?.trim() || "",
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
    staleTime: lookupStaleTime,
    refetchOnWindowFocus: false,
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
    staleTime: lookupStaleTime,
    refetchOnWindowFocus: false,
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
    staleTime: lookupStaleTime,
    refetchOnWindowFocus: false,
  });

  const lgusQuery = useQuery({
    queryKey: ["inspection-lookup-lgus", deferredLguSearch],
    queryFn: () =>
      listLgus({
        accessToken: input.accessToken,
        limit: 25,
        page: 1,
        search: deferredLguSearch || undefined,
      }),
    enabled,
    staleTime: lookupStaleTime,
    refetchOnWindowFocus: false,
  });

  const officesQuery = useQuery({
    queryKey: ["inspection-lookup-offices", deferredOfficeSearch],
    queryFn: () =>
      listOffices({
        accessToken: input.accessToken,
        limit: 25,
        page: 1,
        search: deferredOfficeSearch || undefined,
      }),
    enabled,
    staleTime: lookupStaleTime,
    refetchOnWindowFocus: false,
  });

  return {
    businessesQuery,
    inspectorsQuery,
    lgusQuery,
    officesQuery,
    permitsQuery,
  };
}
