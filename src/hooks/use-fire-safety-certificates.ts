"use client";

import { useQuery } from "@tanstack/react-query";

import { listFireSafetyCertificates } from "@/lib/api/fire-safety-certificates";

export function useFireSafetyCertificates(input: {
  accessToken: string;
  limit?: number;
  officeId?: string;
  page?: number;
}) {
  const enabled = Boolean(input.accessToken && input.officeId);

  const certificatesQuery = useQuery({
    queryKey: [
      "fire-safety-certificates",
      input.officeId,
      input.page ?? 1,
      input.limit ?? 5,
    ],
    queryFn: () =>
      listFireSafetyCertificates({
        accessToken: input.accessToken,
        limit: input.limit,
        officeId: input.officeId,
        page: input.page,
      }),
    enabled,
  });

  return {
    certificatesQuery,
  };
}
