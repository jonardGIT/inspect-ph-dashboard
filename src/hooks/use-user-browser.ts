"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createUserOfficeAssignment,
  deleteUserOfficeAssignment,
  listUserOfficeAssignments,
  listUsers,
} from "@/lib/api/auth";
import { listOffices } from "@/lib/api/offices";

export function useUserBrowser(input: {
  accessToken: string;
  page: number;
  role?: "admin" | "inspector";
  search?: string;
  selectedUserId?: string;
}) {
  const queryClient = useQueryClient();
  const enabled = Boolean(input.accessToken);

  const usersQuery = useQuery({
    queryKey: ["user-browser", input.page, input.role, input.search],
    queryFn: () =>
      listUsers({
        accessToken: input.accessToken,
        limit: 10,
        page: input.page,
        role: input.role,
        search: input.search,
      }),
    enabled,
  });

  const officesQuery = useQuery({
    queryKey: ["user-browser-offices"],
    queryFn: () =>
      listOffices({
        accessToken: input.accessToken,
        limit: 100,
        page: 1,
      }),
    enabled,
  });

  const assignmentsQuery = useQuery({
    queryKey: ["user-browser-assignments", input.selectedUserId],
    queryFn: () =>
      listUserOfficeAssignments({
        accessToken: input.accessToken,
        userId: input.selectedUserId as string,
      }),
    enabled: enabled && Boolean(input.selectedUserId),
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (payload: { officeId: string; userId: string }) =>
      createUserOfficeAssignment({
        accessToken: input.accessToken,
        officeId: payload.officeId,
        userId: payload.userId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user-browser-assignments"],
      });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (payload: { assignmentId: string; userId: string }) =>
      deleteUserOfficeAssignment({
        accessToken: input.accessToken,
        assignmentId: payload.assignmentId,
        userId: payload.userId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user-browser-assignments"],
      });
    },
  });

  return {
    assignmentsQuery,
    createAssignmentMutation,
    deleteAssignmentMutation,
    officesQuery,
    usersQuery,
  };
}
