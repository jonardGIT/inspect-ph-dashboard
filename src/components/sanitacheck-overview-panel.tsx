"use client";

import ModuleInspectionOverviewPanel from "@/components/module-inspection-overview-panel";

export default function SanitaCheckOverviewPanel(input: {
  accessToken: string;
  officeId: string;
  officeLabel: string;
}) {
  return (
    <ModuleInspectionOverviewPanel
      accessToken={input.accessToken}
      emptyDescription="No SanitaCheck inspections found for this office yet"
      officeId={input.officeId}
      officeLabel={input.officeLabel}
      summaryText="Monitor the current sanitation queue for"
      summaryTitle="Sanitation operations snapshot"
    />
  );
}
