"use client";

import ModuleInspectionOverviewPanel from "@/components/module-inspection-overview-panel";

export default function AssessProOverviewPanel(input: {
  accessToken: string;
  officeId: string;
  officeLabel: string;
}) {
  return (
    <ModuleInspectionOverviewPanel
      accessToken={input.accessToken}
      emptyDescription="No AssessPro LGU inspections found for this office yet"
      officeId={input.officeId}
      officeLabel={input.officeLabel}
      summaryText="Monitor the current real property assessment queue for"
      summaryTitle="Property assessment operations snapshot"
    />
  );
}
