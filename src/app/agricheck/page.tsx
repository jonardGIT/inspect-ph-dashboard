import type { Metadata } from "next";

import AgriCheckBrowser from "@/components/agricheck-browser";

export const metadata: Metadata = {
  title: "AgriCheck PH - InspectPH",
};

export default function AgriCheckPage() {
  return <AgriCheckBrowser />;
}
