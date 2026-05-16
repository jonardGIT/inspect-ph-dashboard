"use client";

import { useQuery } from "@tanstack/react-query";

import { getSystemHealth } from "@/lib/api/system";

export function useSystemHealth() {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: getSystemHealth,
    refetchInterval: 30_000,
    retry: false,
  });
}
