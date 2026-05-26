"use client";

import ModuleInspectionOverviewPanel from "@/components/module-inspection-overview-panel";

export default function EcoWatchOverviewPanel(input: {
  accessToken: string;
  officeId: string;
  officeLabel: string;
}) {
  return (
    <ModuleInspectionOverviewPanel
      accessToken={input.accessToken}
      emptyDescription="No EcoWatch inspections found for this office yet"
      officeId={input.officeId}
      officeLabel={input.officeLabel}
      summaryText="Monitor the current environmental compliance queue for"
      summaryTitle="Environmental compliance operations snapshot"
    />
  );
}
