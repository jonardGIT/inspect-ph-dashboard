import type { Metadata } from "next";

import BuildSureBrowser from "@/components/buildsure-browser";

export const metadata: Metadata = {
  title: "BuildSure PH - InspectPH",
};

export default function BuildSurePage() {
  return <BuildSureBrowser />;
}
