"use client";

import ModuleInspectionOverviewPanel from "@/components/module-inspection-overview-panel";

export default function MarketGuardOverviewPanel(input: {
  accessToken: string;
  officeId: string;
  officeLabel: string;
}) {
  return (
    <ModuleInspectionOverviewPanel
      accessToken={input.accessToken}
      emptyDescription="No MarketGuard inspections found for this office yet"
      officeId={input.officeId}
      officeLabel={input.officeLabel}
      summaryText="Monitor the current market inspection queue for"
      summaryTitle="Market operations snapshot"
    />
  );
}
