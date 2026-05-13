"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  assignInspection,
  createAttachmentDownloadIntent,
  getInspectionDetail,
  listInspectionAttachments,
  listInspectionChecklistResults,
  listInspectionFindings,
  listInspectionHistory,
  uploadInspectionAttachment,
} from "@/lib/api/inspections";

function createInspectionQueryKey(inspectionId: string) {
  return ["inspection-workspace", inspectionId] as const;
}

export function useInspectionWorkspace(
  inspectionId: string,
  accessToken: string,
) {
  const queryClient = useQueryClient();
  const enabled = Boolean(inspectionId && accessToken);
  const baseKey = createInspectionQueryKey(inspectionId);

  const inspectionQuery = useQuery({
    queryKey: [...baseKey, "detail"],
    queryFn: () => getInspectionDetail(accessToken, inspectionId),
    enabled,
  });

  const checklistQuery = useQuery({
    queryKey: [...baseKey, "checklist-results"],
    queryFn: () => listInspectionChecklistResults(accessToken, inspectionId),
    enabled,
  });

  const findingsQuery = useQuery({
    queryKey: [...baseKey, "findings"],
    queryFn: () => listInspectionFindings(accessToken, inspectionId),
    enabled,
  });

  const historyQuery = useQuery({
    queryKey: [...baseKey, "history"],
    queryFn: () => listInspectionHistory(accessToken, inspectionId),
    enabled,
  });

  const attachmentsQuery = useQuery({
    queryKey: [...baseKey, "attachments"],
    queryFn: () => listInspectionAttachments(accessToken, inspectionId),
    enabled,
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: (file: File) =>
      uploadInspectionAttachment({
        accessToken,
        file,
        inspectionId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...baseKey, "attachments"],
      });
    },
  });

  const createAttachmentDownloadIntentMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      createAttachmentDownloadIntent({
        accessToken,
        attachmentId,
        inspectionId,
      }),
  });

  const assignInspectionMutation = useMutation({
    mutationFn: (inspectorId: string) =>
      assignInspection({
        accessToken,
        inspectionId,
        inspectorId,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...baseKey, "detail"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["inspections-browser"],
        }),
      ]);
    },
  });

  return {
    assignInspectionMutation,
    attachmentsQuery,
    checklistQuery,
    createAttachmentDownloadIntentMutation,
    findingsQuery,
    historyQuery,
    inspectionQuery,
    uploadAttachmentMutation,
  };
}
