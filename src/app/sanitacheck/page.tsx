import type { Metadata } from "next";

import SanitaCheckBrowser from "@/components/sanitacheck-browser";

export const metadata: Metadata = {
  title: "SanitaCheck - InspectPH",
};

export default function SanitaCheckPage() {
  return <SanitaCheckBrowser />;
}
