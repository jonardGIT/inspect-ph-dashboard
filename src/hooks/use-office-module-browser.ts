"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listModules } from "@/lib/api/modules";
import {
  createOfficeModule,
  deleteOfficeModule,
  listOfficeModules,
} from "@/lib/api/office-modules";
import { listOffices } from "@/lib/api/offices";

export function useOfficeModuleBrowser(input: {
  accessToken: string;
  moduleId?: string;
  officeId?: string;
  page: number;
}) {
  const queryClient = useQueryClient();
  const enabled = Boolean(input.accessToken);

  const officeModulesQuery = useQuery({
    queryKey: [
      "office-module-browser",
      input.page,
      input.officeId,
      input.moduleId,
    ],
    queryFn: () =>
      listOfficeModules({
        accessToken: input.accessToken,
        limit: 10,
        moduleId: input.moduleId,
        officeId: input.officeId,
        page: input.page,
      }),
    enabled,
  });

  const officesQuery = useQuery({
    queryKey: ["office-module-browser-offices"],
    queryFn: () =>
      listOffices({ accessToken: input.accessToken, limit: 100, page: 1 }),
    enabled,
  });

  const modulesQuery = useQuery({
    queryKey: ["office-module-browser-modules"],
    queryFn: () =>
      listModules({ accessToken: input.accessToken, limit: 100, page: 1 }),
    enabled,
  });

  const createOfficeModuleMutation = useMutation({
    mutationFn: (payload: { moduleId: string; officeId: string }) =>
      createOfficeModule({ accessToken: input.accessToken, ...payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["office-module-browser"],
      });
    },
  });

  const deleteOfficeModuleMutation = useMutation({
    mutationFn: (payload: { assignmentId: string }) =>
      deleteOfficeModule({ accessToken: input.accessToken, ...payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["office-module-browser"],
      });
    },
  });

  return {
    createOfficeModuleMutation,
    deleteOfficeModuleMutation,
    modulesQuery,
    officeModulesQuery,
    officesQuery,
  };
}
