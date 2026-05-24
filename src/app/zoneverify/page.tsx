import type { Metadata } from "next";

import ZoneVerifyBrowser from "@/components/zoneverify-browser";

export const metadata: Metadata = {
  title: "ZoneVerify - InspectPH",
};

export default function ZoneVerifyPage() {
  return <ZoneVerifyBrowser />;
}
