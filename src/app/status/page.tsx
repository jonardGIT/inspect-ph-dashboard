import type { Metadata } from "next";
import StatusPageClient from "./status-page-client";

export const metadata: Metadata = {
  title: "Inspect PH Status",
  description: "Public service status for the Inspect PH platform.",
};

export default function StatusPage() {
  return <StatusPageClient />;
}
