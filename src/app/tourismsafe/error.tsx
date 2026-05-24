"use client";

import ModuleBrowserRouteError from "@/components/module-browser-route-error";

interface TourismSafeErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TourismSafeError({
  error,
  reset,
}: TourismSafeErrorProps) {
  return (
    <ModuleBrowserRouteError
      error={error}
      reset={reset}
      eyebrow="TourismSafe operations"
      title="TourismSafe Check"
      description="Load the TourismSafe workspace with the same shared inspection queue and module-scoped office context."
    />
  );
}
