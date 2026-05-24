"use client";

import ModuleBrowserRouteError from "@/components/module-browser-route-error";

interface AgriCheckErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AgriCheckError({ error, reset }: AgriCheckErrorProps) {
  return (
    <ModuleBrowserRouteError
      error={error}
      reset={reset}
      eyebrow="AgriCheck operations"
      title="AgriCheck PH"
      description="Load the AgriCheck workspace with the same shared inspection queue and module-scoped office context."
    />
  );
}
