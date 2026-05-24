import type { Metadata } from "next";

import AssessProBrowser from "@/components/assesspro-browser";

export const metadata: Metadata = {
  title: "AssessPro LGU - InspectPH",
};

export default function AssessProPage() {
  return <AssessProBrowser />;
}
