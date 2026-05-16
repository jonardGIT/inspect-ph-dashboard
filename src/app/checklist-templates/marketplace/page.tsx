import type { Metadata } from "next";

import { ChecklistMarketplace } from "@/components/checklist-marketplace";

export const metadata: Metadata = {
  title: "Template Marketplace — InspectPH",
  description: "Browse, fork, and rate shared checklist templates",
};

export default function ChecklistMarketplacePage() {
  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: 4 }}>Checklist Template Marketplace</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Browse platform-wide and LGU-contributed checklist templates. Fork any
        template into your LGU, rate it, or promote it to platform-default.
      </p>
      <ChecklistMarketplace />
    </div>
  );
}
