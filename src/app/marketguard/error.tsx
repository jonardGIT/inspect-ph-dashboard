"use client";

import ModuleBrowserRouteError from "@/components/module-browser-route-error";

interface MarketGuardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MarketGuardError({
  error,
  reset,
}: MarketGuardErrorProps) {
  return (
    <ModuleBrowserRouteError
      error={error}
      reset={reset}
      eyebrow="MarketGuard operations"
      title="MarketGuard"
      description="Load the MarketGuard workspace with the same shared inspection queue and module-scoped office context."
    />
  );
}
