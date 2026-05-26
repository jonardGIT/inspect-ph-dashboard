"use client";

import ModuleInspectionOverviewPanel from "@/components/module-inspection-overview-panel";

export default function AgriCheckOverviewPanel(input: {
  accessToken: string;
  officeId: string;
  officeLabel: string;
}) {
  return (
    <ModuleInspectionOverviewPanel
      accessToken={input.accessToken}
      emptyDescription="No AgriCheck PH inspections found for this office yet"
      officeId={input.officeId}
      officeLabel={input.officeLabel}
      summaryText="Monitor the current agricultural compliance queue for"
      summaryTitle="Agricultural compliance operations snapshot"
    />
  );
}
