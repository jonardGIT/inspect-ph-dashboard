"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IssueReportRecord } from "@shared/types/api";

import {
  listIssueReports,
  updateIssueReportStatus,
} from "@/lib/api/issue-reports";

export function useIssueReportBrowser(input: {
  accessToken: string;
  category?: IssueReportRecord["category"];
  page: number;
  search?: string;
  status?: IssueReportRecord["status"];
}) {
  const queryClient = useQueryClient();
  const enabled = Boolean(input.accessToken);

  const issueReportsQuery = useQuery({
    queryKey: [
      "issue-report-browser",
      input.page,
      input.search,
      input.category,
      input.status,
    ],
    queryFn: () =>
      listIssueReports({
        accessToken: input.accessToken,
        category: input.category,
        limit: 10,
        page: input.page,
        search: input.search,
        status: input.status,
      }),
    enabled,
  });

  const updateIssueReportStatusMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      status: IssueReportRecord["status"];
    }) =>
      updateIssueReportStatus({
        accessToken: input.accessToken,
        id: payload.id,
        status: payload.status,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["issue-report-browser"],
      });
    },
  });

  return { issueReportsQuery, updateIssueReportStatusMutation };
}