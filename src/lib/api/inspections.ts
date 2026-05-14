import type {
  ApiListResponse,
  ApiResponse,
  AttachmentDownloadIntent,
  AttachmentRecord,
  AttachmentUploadIntent,
  FindingRecord,
  InspectionHistoryEvent,
  InspectionChecklistResultRecord,
  InspectionMapPoint,
  InspectionRecord,
  InspectionSummary,
} from "@shared/types/api";

import { createApiClient, getApiOrigin } from "./http";

const API_V1 = "/api/v1";

function resolveUploadTarget(intent: AttachmentUploadIntent): string {
  if (intent.uploadUrl) {
    return intent.uploadUrl;
  }

  if (intent.uploadPath) {
    return `${getApiOrigin()}${intent.uploadPath}`;
  }

  throw new Error("Upload target is missing from the attachment upload intent");
}

export async function getInspectionDetail(
  accessToken: string,
  inspectionId: string,
): Promise<InspectionRecord> {
  const client = createApiClient(accessToken);
  const response = await client.get<ApiResponse<InspectionRecord>>(
    `${API_V1}/inspections/${inspectionId}`,
  );

  return response.data.data;
}

export async function getInspectionSummary(input: {
  accessToken: string;
  from?: string;
  lguId?: string;
  officeId?: string;
  to?: string;
}): Promise<InspectionSummary> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<InspectionSummary>>(
    `${API_V1}/inspections/summary`,
    {
      params: {
        ...(input.from ? { from: input.from } : {}),
        ...(input.lguId ? { lguId: input.lguId } : {}),
        ...(input.officeId ? { officeId: input.officeId } : {}),
        ...(input.to ? { to: input.to } : {}),
      },
    },
  );

  return response.data.data;
}

export async function listInspectionMapPoints(input: {
  accessToken: string;
  from?: string;
  lguId?: string;
  officeId?: string;
  status?: InspectionRecord["status"];
  to?: string;
}): Promise<InspectionMapPoint[]> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<InspectionMapPoint[]>>(
    `${API_V1}/inspections/map-points`,
    {
      params: {
        ...(input.from ? { from: input.from } : {}),
        ...(input.lguId ? { lguId: input.lguId } : {}),
        ...(input.officeId ? { officeId: input.officeId } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.to ? { to: input.to } : {}),
      },
    },
  );

  return response.data.data;
}

export async function listInspections(input: {
  accessToken: string;
  businessId?: string;
  inspectorId?: string;
  limit?: number;
  lguId?: string;
  officeId?: string;
  page?: number;
  status?: InspectionRecord["status"];
}): Promise<ApiListResponse<InspectionRecord>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<InspectionRecord>>(
    `${API_V1}/inspections`,
    {
      params: {
        ...(input.businessId ? { businessId: input.businessId } : {}),
        ...(input.inspectorId ? { inspectorId: input.inspectorId } : {}),
        ...(input.limit ? { limit: input.limit } : {}),
        ...(input.lguId ? { lguId: input.lguId } : {}),
        ...(input.officeId ? { officeId: input.officeId } : {}),
        ...(input.page ? { page: input.page } : {}),
        ...(input.status ? { status: input.status } : {}),
      },
    },
  );

  return response.data;
}

export async function createInspection(input: {
  accessToken: string;
  businessId: string;
  officeId: string;
  permitRecordId: string;
  scheduledAt: string;
  inspectorId?: string;
  notes?: string;
}): Promise<InspectionRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<InspectionRecord>>(
    `${API_V1}/inspections`,
    {
      businessId: input.businessId,
      ...(input.inspectorId ? { inspectorId: input.inspectorId } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
      officeId: input.officeId,
      permitRecordId: input.permitRecordId,
      scheduledAt: input.scheduledAt,
    },
  );

  return response.data.data;
}

export async function assignInspection(input: {
  accessToken: string;
  inspectionId: string;
  inspectorId: string;
}): Promise<InspectionRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.patch<ApiResponse<InspectionRecord>>(
    `${API_V1}/inspections/${input.inspectionId}/assignment`,
    {
      inspectorId: input.inspectorId,
    },
  );

  return response.data.data;
}

export async function listInspectionChecklistResults(
  accessToken: string,
  inspectionId: string,
): Promise<InspectionChecklistResultRecord[]> {
  const client = createApiClient(accessToken);
  const response = await client.get<
    ApiResponse<InspectionChecklistResultRecord[]>
  >(`${API_V1}/inspections/${inspectionId}/checklist-results`);

  return response.data.data;
}

export async function listInspectionFindings(
  accessToken: string,
  inspectionId: string,
): Promise<FindingRecord[]> {
  const client = createApiClient(accessToken);
  const response = await client.get<ApiResponse<FindingRecord[]>>(
    `${API_V1}/inspections/${inspectionId}/findings`,
  );

  return response.data.data;
}

export async function listInspectionAttachments(
  accessToken: string,
  inspectionId: string,
): Promise<AttachmentRecord[]> {
  const client = createApiClient(accessToken);
  const response = await client.get<ApiResponse<AttachmentRecord[]>>(
    `${API_V1}/inspections/${inspectionId}/attachments`,
  );

  return response.data.data;
}

export async function listInspectionHistory(
  accessToken: string,
  inspectionId: string,
): Promise<InspectionHistoryEvent[]> {
  const client = createApiClient(accessToken);
  const response = await client.get<ApiResponse<InspectionHistoryEvent[]>>(
    `${API_V1}/inspections/${inspectionId}/history`,
  );

  return response.data.data;
}

export async function createAttachmentDownloadIntent(input: {
  accessToken: string;
  attachmentId: string;
  inspectionId: string;
}): Promise<AttachmentDownloadIntent> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<AttachmentDownloadIntent>>(
    `${API_V1}/inspections/${input.inspectionId}/attachments/${input.attachmentId}/download-intent`,
  );

  return response.data.data;
}

export async function createAttachmentUploadIntent(input: {
  accessToken: string;
  fileName: string;
  inspectionId: string;
}): Promise<AttachmentUploadIntent> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<AttachmentUploadIntent>>(
    `${API_V1}/inspections/${input.inspectionId}/attachments/upload-intents`,
    {
      fileName: input.fileName,
    },
  );

  return response.data.data;
}

export async function uploadAttachmentBinary(
  intent: AttachmentUploadIntent,
  file: File,
): Promise<void> {
  const response = await fetch(resolveUploadTarget(intent), {
    method: intent.uploadMethod,
    headers: intent.uploadHeaders,
    body: file,
  });

  if (!response.ok) {
    throw new Error("Binary upload failed");
  }
}

export async function createInspectionAttachment(input: {
  accessToken: string;
  inspectionId: string;
  file: File;
  storageKey: string;
}): Promise<AttachmentRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<AttachmentRecord>>(
    `${API_V1}/inspections/${input.inspectionId}/attachments`,
    {
      capturedAt: new Date().toISOString(),
      fileName: input.file.name,
      fileSizeBytes: input.file.size,
      mimeType: input.file.type || "application/octet-stream",
      storageKey: input.storageKey,
    },
  );

  return response.data.data;
}

export async function uploadInspectionAttachment(input: {
  accessToken: string;
  file: File;
  inspectionId: string;
}): Promise<AttachmentRecord> {
  const intent = await createAttachmentUploadIntent({
    accessToken: input.accessToken,
    fileName: input.file.name,
    inspectionId: input.inspectionId,
  });

  await uploadAttachmentBinary(intent, input.file);

  return createInspectionAttachment({
    accessToken: input.accessToken,
    file: input.file,
    inspectionId: input.inspectionId,
    storageKey: intent.storageKey,
  });
}
