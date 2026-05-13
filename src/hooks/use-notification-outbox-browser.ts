"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NotificationOutboxRecord } from "@shared/types/api";

import {
  listNotificationOutbox,
  updateNotificationOutboxStatus,
} from "@/lib/api/notifications-outbox";

export function useNotificationOutboxBrowser(input: {
  accessToken: string;
  enabled?: boolean;
  eventType?: NotificationOutboxRecord["eventType"];
  page: number;
  search?: string;
  status?: NotificationOutboxRecord["status"];
}) {
  const queryClient = useQueryClient();

  return {
    notificationOutboxQuery: useQuery({
      enabled: input.enabled ?? Boolean(input.accessToken),
      queryKey: [
        "notification-outbox-browser",
        input.page,
        input.eventType,
        input.search,
        input.status,
      ],
      queryFn: () =>
        listNotificationOutbox({
          accessToken: input.accessToken,
          eventType: input.eventType,
          page: input.page,
          search: input.search,
          status: input.status,
        }),
    }),
    updateNotificationStatusMutation: useMutation({
      mutationFn: (payload: {
        id: string;
        status: NotificationOutboxRecord["status"];
      }) =>
        updateNotificationOutboxStatus({
          accessToken: input.accessToken,
          id: payload.id,
          status: payload.status,
        }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["notification-outbox-browser"],
        });
      },
    }),
  };
}
