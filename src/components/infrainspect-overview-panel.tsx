"use client";

import ModuleInspectionOverviewPanel from "@/components/module-inspection-overview-panel";

export default function InfraInspectOverviewPanel(input: {
  accessToken: string;
  officeId: string;
  officeLabel: string;
}) {
  return (
    <ModuleInspectionOverviewPanel
      accessToken={input.accessToken}
      emptyDescription="No InfraInspect Pro inspections found for this office yet"
      officeId={input.officeId}
      officeLabel={input.officeLabel}
      summaryText="Monitor the current infrastructure and building compliance queue for"
      summaryTitle="Infrastructure inspection operations snapshot"
    />
  );
}
