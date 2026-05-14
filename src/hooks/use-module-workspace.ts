"use client";

import { useQuery } from "@tanstack/react-query";

import { listModules } from "@/lib/api/modules";
import { listOfficeModules } from "@/lib/api/office-modules";

export function useModuleWorkspace(input: {
  accessToken: string;
  moduleCode: string;
}) {
  const enabled = Boolean(input.accessToken);

  const moduleQuery = useQuery({
    queryKey: ["module-workspace", input.moduleCode],
    queryFn: async () => {
      const response = await listModules({
        accessToken: input.accessToken,
        isActive: true,
        limit: 25,
        page: 1,
        search: input.moduleCode,
      });

      return (
        response.data.find(
          (module) =>
            module.code.toLowerCase() === input.moduleCode.toLowerCase(),
        ) ?? null
      );
    },
    enabled,
  });

  const officeModulesQuery = useQuery({
    queryKey: ["module-workspace-offices", moduleQuery.data?.id],
    queryFn: () =>
      listOfficeModules({
        accessToken: input.accessToken,
        limit: 100,
        moduleId: moduleQuery.data!.id,
        page: 1,
      }),
    enabled: enabled && Boolean(moduleQuery.data?.id),
  });

  return {
    moduleQuery,
    officeModulesQuery,
  };
}
