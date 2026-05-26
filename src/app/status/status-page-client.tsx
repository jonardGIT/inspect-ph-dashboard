"use client";

import dynamic from "next/dynamic";

const PublicStatusPage = dynamic(
  () => import("@/components/public-status-page"),
  {
    ssr: false,
  },
);

export default function StatusPageClient() {
  return <PublicStatusPage />;
}
