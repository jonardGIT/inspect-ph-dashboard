import type {
  ApiResponse,
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
