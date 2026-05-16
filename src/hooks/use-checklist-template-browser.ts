"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createChecklistTemplate,
  listChecklistTemplates,
  patchChecklistTemplateActive,
} from "@/lib/api/checklist-templates";

export function useChecklistTemplateBrowser(input: {
  accessToken: string;
  isActive?: boolean;
  module?: string;
  page: number;
  search?: string;
}) {
  const queryClient = useQueryClient();
  const enabled = Boolean(input.accessToken);

  const templatesQuery = useQuery({
    queryKey: [
      "checklist-template-browser",
      input.page,
      input.search,
      input.isActive,
      input.module,
    ],
    queryFn: () =>
      listChecklistTemplates({
        accessToken: input.accessToken,
        isActive: input.isActive,
        limit: 20,
        module: input.module,
        page: input.page,
        search: input.search,
      }),
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: createChecklistTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["checklist-template-browser"],
      });
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: patchChecklistTemplateActive,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["checklist-template-browser"],
      });
    },
  });

  return { createMutation, setActiveMutation, templatesQuery };
}
