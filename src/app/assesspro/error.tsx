"use client";

import ModuleBrowserRouteError from "@/components/module-browser-route-error";

interface AssessProErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AssessProError({ error, reset }: AssessProErrorProps) {
  return (
    <ModuleBrowserRouteError
      error={error}
      reset={reset}
      eyebrow="AssessPro operations"
      title="AssessPro LGU"
      description="Load the AssessPro workspace with the same shared inspection queue and module-scoped office context."
    />
  );
}
