"use client";

import ModuleBrowserRouteError from "@/components/module-browser-route-error";

interface InfraInspectErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InfraInspectError({
  error,
  reset,
}: InfraInspectErrorProps) {
  return (
    <ModuleBrowserRouteError
      error={error}
      reset={reset}
      eyebrow="InfraInspect operations"
      title="InfraInspect Pro"
      description="Load the InfraInspect workspace with the same shared inspection queue and module-scoped office context."
    />
  );
}
