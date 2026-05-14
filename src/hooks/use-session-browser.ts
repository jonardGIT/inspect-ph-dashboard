"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listAuthSessions,
  listUserAuthSessions,
  listUsers,
  revokeAuthSession,
} from "@/lib/api/auth";

export function useSessionBrowser(input: {
  accessToken: string;
  isAdmin: boolean;
  selectedUserId?: string;
}) {
  const queryClient = useQueryClient();
  const enabled = Boolean(input.accessToken);

  const usersQuery = useQuery({
    queryKey: ["session-browser-users"],
    queryFn: () =>
      listUsers({
        accessToken: input.accessToken,
        limit: 100,
        page: 1,
      }),
    enabled: enabled && input.isAdmin,
  });

  const sessionsQuery = useQuery({
    queryKey: ["session-browser", input.selectedUserId, input.isAdmin],
    queryFn: () => {
      if (input.isAdmin && input.selectedUserId) {
        return listUserAuthSessions({
          accessToken: input.accessToken,
          userId: input.selectedUserId,
        });
      }

      return listAuthSessions({ accessToken: input.accessToken });
    },
    enabled,
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (payload: { sessionId: string }) =>
      revokeAuthSession({
        accessToken: input.accessToken,
        sessionId: payload.sessionId,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["session-browser"] }),
        queryClient.invalidateQueries({ queryKey: ["session-browser-users"] }),
      ]);
    },
  });

  return {
    revokeSessionMutation,
    sessionsQuery,
    usersQuery,
  };
}
