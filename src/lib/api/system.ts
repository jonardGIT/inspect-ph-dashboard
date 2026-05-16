import axios from "axios";

import { getApiOrigin } from "./http";

const API_V1 = "/api/v1";

export interface SystemHealthData {
  db: "ok" | "error";
  status: "healthy" | "degraded";
}

export async function getSystemHealth(): Promise<SystemHealthData> {
  const response = await axios.get<{ data: SystemHealthData }>(
    `${getApiOrigin()}${API_V1}/health`,
  );
  return response.data.data;
}
