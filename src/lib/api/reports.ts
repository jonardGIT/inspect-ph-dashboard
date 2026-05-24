import type {
  ApiListResponse,
  ApiResponse,
  InspectionTwinSimulationReport,
  InspectorWellnessReport,
  KpiReport,
  PaymentAnomalyFlag,
  PaymentReconciliationReport,
  TreasurerReport,
} from "@shared/types/api";

import { createApiClient } from "./http";

const API_V1 = "/api/v1";

export async function getPaymentReconciliation(input: {
  accessToken: string;
  fromDate?: string;
  toDate?: string;
  lguId?: string;
  officeId?: string;
}): Promise<PaymentReconciliationReport> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<PaymentReconciliationReport>>(
    `${API_V1}/reports/payments/reconciliation`,
    {
      params: {
        ...(input.fromDate ? { fromDate: input.fromDate } : {}),
        ...(input.toDate ? { toDate: input.toDate } : {}),
        ...(input.lguId ? { lguId: input.lguId } : {}),
        ...(input.officeId ? { officeId: input.officeId } : {}),
      },
    },
  );

  return response.data.data;
}

export async function getTreasurerReport(input: {
  accessToken: string;
  fromDate?: string;
  toDate?: string;
  officeId?: string;
  lguId?: string;
}): Promise<TreasurerReport> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<TreasurerReport>>(
    `${API_V1}/reports/treasurer`,
    {
      params: {
        ...(input.fromDate ? { fromDate: input.fromDate } : {}),
        ...(input.toDate ? { toDate: input.toDate } : {}),
        ...(input.officeId ? { officeId: input.officeId } : {}),
        ...(input.lguId ? { lguId: input.lguId } : {}),
      },
    },
  );

  return response.data.data;
}

export async function getKpiReport(input: {
  accessToken: string;
  fromDate?: string;
  toDate?: string;
  lguId?: string;
  officeId?: string;
}): Promise<KpiReport> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<KpiReport>>(
    `${API_V1}/reports/kpi`,
    {
      params: {
        ...(input.fromDate ? { fromDate: input.fromDate } : {}),
        ...(input.toDate ? { toDate: input.toDate } : {}),
        ...(input.lguId ? { lguId: input.lguId } : {}),
        ...(input.officeId ? { officeId: input.officeId } : {}),
      },
    },
  );

  return response.data.data;
}

export async function getInspectionTwinReport(input: {
  accessToken: string;
  failOnCriticalSeverity?: boolean;
  failOnHighSeverity?: boolean;
  fromDate?: string;
  lguId?: string;
  maxFailedChecklistItems?: number;
  minChecklistPassRatePct?: number;
  moduleCode?: string;
  officeId?: string;
  toDate?: string;
}): Promise<InspectionTwinSimulationReport> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<
    ApiResponse<InspectionTwinSimulationReport>
  >(`${API_V1}/reports/inspection-twin`, {
    params: {
      ...(typeof input.failOnCriticalSeverity === "boolean"
        ? { failOnCriticalSeverity: String(input.failOnCriticalSeverity) }
        : {}),
      ...(typeof input.failOnHighSeverity === "boolean"
        ? { failOnHighSeverity: String(input.failOnHighSeverity) }
        : {}),
      ...(input.fromDate ? { fromDate: input.fromDate } : {}),
      ...(input.lguId ? { lguId: input.lguId } : {}),
      ...(typeof input.maxFailedChecklistItems === "number"
        ? { maxFailedChecklistItems: input.maxFailedChecklistItems }
        : {}),
      ...(typeof input.minChecklistPassRatePct === "number"
        ? { minChecklistPassRatePct: input.minChecklistPassRatePct }
        : {}),
      ...(input.moduleCode ? { moduleCode: input.moduleCode } : {}),
      ...(input.officeId ? { officeId: input.officeId } : {}),
      ...(input.toDate ? { toDate: input.toDate } : {}),
    },
  });

  return response.data.data;
}

export async function getWellnessReport(input: {
  accessToken: string;
  fromDate?: string;
  toDate?: string;
  lguId?: string;
}): Promise<InspectorWellnessReport> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<InspectorWellnessReport>>(
    `${API_V1}/reports/wellness`,
    {
      params: {
        ...(input.fromDate ? { fromDate: input.fromDate } : {}),
        ...(input.toDate ? { toDate: input.toDate } : {}),
        ...(input.lguId ? { lguId: input.lguId } : {}),
      },
    },
  );
  return response.data.data;
}

export async function listPaymentAnomalyFlags(input: {
  accessToken: string;
  includeResolved?: boolean;
  lguId?: string;
  page?: number;
  limit?: number;
}): Promise<ApiListResponse<PaymentAnomalyFlag>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<PaymentAnomalyFlag>>(
    `${API_V1}/reports/payment-anomalies`,
    {
      params: {
        ...(input.includeResolved ? { includeResolved: "true" } : {}),
        ...(input.lguId ? { lguId: input.lguId } : {}),
        ...(input.page ? { page: input.page } : {}),
        ...(input.limit ? { limit: input.limit } : {}),
      },
    },
  );
  return response.data;
}

export async function resolvePaymentAnomalyFlag(input: {
  accessToken: string;
  flagId: string;
}): Promise<PaymentAnomalyFlag> {
  const client = createApiClient(input.accessToken);
  const response = await client.patch<ApiResponse<PaymentAnomalyFlag>>(
    `${API_V1}/reports/payment-anomalies/${input.flagId}/resolve`,
  );
  return response.data.data;
}
