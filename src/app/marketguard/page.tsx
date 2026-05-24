import type { Metadata } from "next";

import MarketGuardBrowser from "@/components/marketguard-browser";

export const metadata: Metadata = {
  title: "MarketGuard - InspectPH",
};

export default function MarketGuardPage() {
  return <MarketGuardBrowser />;
}
