import type { Metadata } from "next";

import TourismSafeBrowser from "@/components/tourismsafe-browser";

export const metadata: Metadata = {
  title: "TourismSafe Check - InspectPH",
};

export default function TourismSafePage() {
  return <TourismSafeBrowser />;
}
