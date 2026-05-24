import type { Metadata } from "next";

import EcoWatchBrowser from "@/components/ecowatch-browser";

export const metadata: Metadata = {
  title: "EcoWatch LGU - InspectPH",
};

export default function EcoWatchPage() {
  return <EcoWatchBrowser />;
}
