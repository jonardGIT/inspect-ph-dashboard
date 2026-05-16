import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "@/hooks/use-auth-session";
import {
  getDataSubjectRequest,
  listDataSubjectRequests,
  updateDataSubjectRequest,
} from "@/lib/api/privacy";
import type {
  DataSubjectRequestStatus,
  DataSubjectRequestType,
} from "@shared/types/api";

const QUERY_KEY = "data-subject-requests";

export function useDataSubjectRequests(
  filters: {
    limit?: number;
    offset?: number;
    status?: DataSubjectRequestStatus;
    type?: DataSubjectRequestType;
  } = {},
) {
  const { accessToken } = useAuthSession();

  return useQuery({
    enabled: !!accessToken,
    queryFn: () =>
      listDataSubjectRequests({
        accessToken,
        limit: filters.limit ?? 20,
        offset: filters.offset ?? 0,
        status: filters.status,
        type: filters.type,
      }),
    queryKey: [QUERY_KEY, filters],
  });
}

export function useDataSubjectRequest(id: string) {
  const { accessToken } = useAuthSession();

  return useQuery({
    enabled: !!accessToken && !!id,
    queryFn: () => getDataSubjectRequest({ accessToken, id }),
    queryKey: [QUERY_KEY, id],
  });
}

export function useUpdateDataSubjectRequest() {
  const { accessToken } = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id: string;
      status: DataSubjectRequestStatus;
      response?: string;
    }) =>
      updateDataSubjectRequest({
        accessToken,
        id: input.id,
        update: { response: input.response, status: input.status },
      }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
