/**
 * Shared axios singleton for authenticated API requests.
 * Reads the JWT access token from localStorage automatically via a request
 * interceptor so callers do not need to pass it explicitly.
 */
import axios from "axios";

import type { AuthSession } from "@/types";

import { getApiOrigin } from "./http";

const AUTH_SESSION_STORAGE_KEY = "inspect-ph-dashboard-session";

export const apiClient = axios.create({
  baseURL: getApiOrigin(),
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (raw) {
      try {
        const session = JSON.parse(raw) as AuthSession;
        const token = session?.tokens?.accessToken;
        if (token && !config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      } catch {
        // Ignore malformed session data
      }
    }
  }
  return config;
});
