import type { Metadata } from "next";

import { NationalIntegrationsPanel } from "@/components/national-integrations-panel";

export const metadata: Metadata = {
  title: "National Integrations — InspectPH",
};

export default function NationalIntegrationsPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>National Integrations</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        Verify identities and business registrations against Philippine
        government registries (PhilSys, BIR, DTI/SEC) and monitor PAGASA /
        PHIVOLCS disaster alerts.
      </p>
      <NationalIntegrationsPanel />
    </div>
  );
}
