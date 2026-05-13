import axios, { AxiosError } from "axios";

import type { ApiError } from "@shared/types/api";

const DEFAULT_API_ORIGIN = "http://localhost:4000";

export function getApiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_ORIGIN).replace(
    /\/$/,
    "",
  );
}

export function createApiClient(accessToken: string) {
  return axios.create({
    baseURL: getApiOrigin(),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;

    return apiError?.error.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Request failed";
}
