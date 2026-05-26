"use client";

import MarketGuardOverviewPanel from "@/components/marketguard-overview-panel";
import ModuleInspectionWorkspace from "@/components/module-inspection-workspace";

const MARKETGUARD_MODULE_CODE = "MARKET";

export default function MarketGuardBrowser() {
  return (
    <ModuleInspectionWorkspace
      emptyAssignmentsDescription="No MarketGuard office assignments found yet"
      eyebrow="MarketGuard operations"
      loadingDescription="Loading the office assignment for the MarketGuard inspection workspace."
      moduleCode={MARKETGUARD_MODULE_CODE}
      officeSelectAriaLabel="Select MarketGuard office assignment"
      renderSupplementalContent={({ accessToken, officeId, officeLabel }) => (
        <MarketGuardOverviewPanel
          accessToken={accessToken}
          officeId={officeId}
          officeLabel={officeLabel}
        />
      )}
      title="MarketGuard"
      workspaceDescription="Run MarketGuard inspections through the same core queue, metrics, and workspace flow already used for BPLO, FireGuard, SanitaCheck, and BuildSure, but scoped to the MarketGuard office assignment."
    />
  );
}
