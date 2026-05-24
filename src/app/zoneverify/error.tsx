"use client";

import ModuleBrowserRouteError from "@/components/module-browser-route-error";

interface ZoneVerifyErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ZoneVerifyError({
  error,
  reset,
}: ZoneVerifyErrorProps) {
  return (
    <ModuleBrowserRouteError
      error={error}
      reset={reset}
      eyebrow="ZoneVerify operations"
      title="ZoneVerify"
      description="Load the ZoneVerify workspace with the same shared inspection queue and module-scoped office context."
    />
  );
}
