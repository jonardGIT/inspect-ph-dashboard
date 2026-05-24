import type { Metadata } from "next";

import PublicStatusPage from "@/components/public-status-page";

export const metadata: Metadata = {
  title: "Inspect PH Status",
  description: "Public service status for the Inspect PH platform.",
};

export default function StatusPage() {
  return <PublicStatusPage />;
}
