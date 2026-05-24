"use client";

import ModuleBrowserRouteError from "@/components/module-browser-route-error";

interface SanitaCheckErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SanitaCheckError({
  error,
  reset,
}: SanitaCheckErrorProps) {
  return (
    <ModuleBrowserRouteError
      error={error}
      reset={reset}
      eyebrow="SanitaCheck operations"
      title="SanitaCheck"
      description="Load the SanitaCheck workspace with the same shared inspection queue and module-scoped office context."
    />
  );
}
