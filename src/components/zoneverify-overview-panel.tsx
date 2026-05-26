"use client";

import ModuleInspectionOverviewPanel from "@/components/module-inspection-overview-panel";

export default function ZoneVerifyOverviewPanel(input: {
  accessToken: string;
  officeId: string;
  officeLabel: string;
}) {
  return (
    <ModuleInspectionOverviewPanel
      accessToken={input.accessToken}
      emptyDescription="No ZoneVerify inspections found for this office yet"
      officeId={input.officeId}
      officeLabel={input.officeLabel}
      summaryText="Monitor the current zoning and land use compliance queue for"
      summaryTitle="Zoning compliance operations snapshot"
    />
  );
}
