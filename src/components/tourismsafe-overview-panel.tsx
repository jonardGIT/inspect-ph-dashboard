"use client";

import ModuleInspectionOverviewPanel from "@/components/module-inspection-overview-panel";

export default function TourismSafeOverviewPanel(input: {
  accessToken: string;
  officeId: string;
  officeLabel: string;
}) {
  return (
    <ModuleInspectionOverviewPanel
      accessToken={input.accessToken}
      emptyDescription="No TourismSafe Check inspections found for this office yet"
      officeId={input.officeId}
      officeLabel={input.officeLabel}
      summaryText="Monitor the current tourism establishment compliance queue for"
      summaryTitle="Tourism establishment operations snapshot"
    />
  );
}
