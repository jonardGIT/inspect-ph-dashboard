"use client";

import ModuleBrowserRouteError from "@/components/module-browser-route-error";

interface EcoWatchErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function EcoWatchError({ error, reset }: EcoWatchErrorProps) {
  return (
    <ModuleBrowserRouteError
      error={error}
      reset={reset}
      eyebrow="EcoWatch operations"
      title="EcoWatch LGU"
      description="Load the EcoWatch workspace with the same shared inspection queue and module-scoped office context."
    />
  );
}
