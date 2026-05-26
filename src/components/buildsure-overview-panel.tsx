"use client";

import ModuleInspectionOverviewPanel from "@/components/module-inspection-overview-panel";

export default function BuildSureOverviewPanel(input: {
  accessToken: string;
  officeId: string;
  officeLabel: string;
}) {
  return (
    <ModuleInspectionOverviewPanel
      accessToken={input.accessToken}
      emptyDescription="No BuildSure inspections found for this office yet"
      officeId={input.officeId}
      officeLabel={input.officeLabel}
      summaryText="Monitor the current building inspection queue for"
      summaryTitle="Building safety operations snapshot"
    />
  );
}
