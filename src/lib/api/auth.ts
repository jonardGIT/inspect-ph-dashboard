import type {
  ApiListResponse,
  ApiResponse,
  AuthSessionRecord,
  AuthTokens,
  OfficeRecord,
  User,
  UserOfficeAssignmentRecord,
} from "@shared/types/api";

import { createApiClient, getApiOrigin } from "./http";

const API_V1 = "/api/v1";

export interface AuthSession {
  tokens: AuthTokens;
  user: User;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  const response = await fetch(`${getApiOrigin()}${API_V1}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ApiResponse<AuthSession> & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || "Login failed");
  }

  return payload.data;
}

export async function getCurrentUser(accessToken: string): Promise<User> {
  const client = createApiClient(accessToken);
  const response = await client.get<ApiResponse<User>>(`${API_V1}/auth/me`);

  return response.data.data;
}

export async function listUsers(input: {
  accessToken: string;
  limit?: number;
  page?: number;
  role?: User["role"];
  search?: string;
}): Promise<ApiListResponse<User>> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiListResponse<User>>(
    `${API_V1}/auth/users`,
    {
      params: {
        ...(input.limit ? { limit: input.limit } : {}),
        ...(input.page ? { page: input.page } : {}),
        ...(input.role ? { role: input.role } : {}),
        ...(input.search ? { search: input.search } : {}),
      },
    },
  );

  return response.data;
}

export async function listAuthSessions(input: {
  accessToken: string;
}): Promise<AuthSessionRecord[]> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<AuthSessionRecord[]>>(
    `${API_V1}/auth/sessions`,
  );

  return response.data.data;
}

export async function listUserAuthSessions(input: {
  accessToken: string;
  userId: string;
}): Promise<AuthSessionRecord[]> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<AuthSessionRecord[]>>(
    `${API_V1}/auth/users/${input.userId}/sessions`,
  );

  return response.data.data;
}

export async function revokeAuthSession(input: {
  accessToken: string;
  sessionId: string;
}): Promise<void> {
  const client = createApiClient(input.accessToken);

  await client.delete(`${API_V1}/auth/sessions/${input.sessionId}`);
}

export async function listUserOfficeAssignments(input: {
  accessToken: string;
  userId: string;
}): Promise<UserOfficeAssignmentRecord[]> {
  const client = createApiClient(input.accessToken);
  const response = await client.get<ApiResponse<UserOfficeAssignmentRecord[]>>(
    `${API_V1}/auth/users/${input.userId}/office-assignments`,
  );

  return response.data.data;
}

export async function createUserOfficeAssignment(input: {
  accessToken: string;
  officeId: OfficeRecord["id"];
  userId: string;
}): Promise<UserOfficeAssignmentRecord> {
  const client = createApiClient(input.accessToken);
  const response = await client.post<ApiResponse<UserOfficeAssignmentRecord>>(
    `${API_V1}/auth/users/${input.userId}/office-assignments`,
    {
      officeId: input.officeId,
    },
  );

  return response.data.data;
}

export async function deleteUserOfficeAssignment(input: {
  accessToken: string;
  assignmentId: string;
  userId: string;
}): Promise<void> {
  const client = createApiClient(input.accessToken);

  await client.delete(
    `${API_V1}/auth/users/${input.userId}/office-assignments/${input.assignmentId}`,
  );
}
