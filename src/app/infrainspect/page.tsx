import type { Metadata } from "next";

import InfraInspectBrowser from "@/components/infrainspect-browser";

export const metadata: Metadata = {
  title: "InfraInspect Pro - InspectPH",
};

export default function InfraInspectPage() {
  return <InfraInspectBrowser />;
}
