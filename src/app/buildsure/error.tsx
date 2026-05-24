"use client";

import ModuleBrowserRouteError from "@/components/module-browser-route-error";

interface BuildSureErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BuildSureError({ error, reset }: BuildSureErrorProps) {
  return (
    <ModuleBrowserRouteError
      error={error}
      reset={reset}
      eyebrow="BuildSure operations"
      title="BuildSure PH"
      description="Load the BuildSure workspace with the same shared inspection queue and module-scoped office context."
    />
  );
}
