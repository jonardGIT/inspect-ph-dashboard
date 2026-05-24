import axios from "axios";

import type {
  ApiListResponse,
  ApiResponse,
  PaymentRecord,
} from "@shared/types/api";

import { createApiClient, getApiOrigin } from "./http";

const API_V1 = "/api/v1";

export async function listPayments(input: {
  accessToken: string;
  limit?: number;
  page?: number;
  permitId?: string;
  provider?: PaymentRecord["provider"];
  status?: PaymentRecord["status"];
}) {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<PaymentRecord>>(
    `${API_V1}/payments`,
    {
      params: {
        ...(input.limit ? { limit: input.limit } : {}),
        ...(input.page ? { page: input.page } : {}),
        ...(input.permitId ? { permitId: input.permitId } : {}),
        ...(input.provider ? { provider: input.provider } : {}),
        ...(input.status ? { status: input.status } : {}),
      },
    },
  );

  return response.data;
}

export async function reconcilePayment(input: {
  accessToken: string;
  note?: string;
  paymentId: string;
  status: "paid" | "failed" | "refunded";
}) {
  const client = createApiClient(input.accessToken);
  const response = await client.patch<ApiResponse<PaymentRecord>>(
    `${API_V1}/payments/${input.paymentId}/reconcile`,
    {
      ...(input.note ? { note: input.note } : {}),
      status: input.status,
    },
  );

  return response.data.data;
}

export async function getPublicPaymentByReferenceNumber(input: {
  referenceNumber: string;
}) {
  const response = await axios.get<ApiResponse<PaymentRecord>>(
    `${getApiOrigin()}${API_V1}/payments/public/${encodeURIComponent(input.referenceNumber)}`,
  );

  return response.data.data;
}

export function getPaymentReceiptUrl(paymentId: string): string {
  return `${getApiOrigin()}${API_V1}/payments/${paymentId}/receipt`;
}
