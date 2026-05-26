"use client";

import EcoWatchOverviewPanel from "@/components/ecowatch-overview-panel";
import ModuleInspectionWorkspace from "@/components/module-inspection-workspace";

const ECOWATCH_MODULE_CODE = "ECOWATCH";

export default function EcoWatchBrowser() {
  return (
    <ModuleInspectionWorkspace
      emptyAssignmentsDescription="No EcoWatch office assignments found yet"
      eyebrow="EcoWatch operations"
      loadingDescription="Loading the office assignment for the EcoWatch inspection workspace."
      moduleCode={ECOWATCH_MODULE_CODE}
      officeSelectAriaLabel="Select EcoWatch office assignment"
      renderSupplementalContent={({ accessToken, officeId, officeLabel }) => (
        <EcoWatchOverviewPanel
          accessToken={accessToken}
          officeId={officeId}
          officeLabel={officeLabel}
        />
      )}
      title="EcoWatch LGU"
      workspaceDescription="Run EcoWatch environmental inspections through the shared core queue, scoped to the EcoWatch-enabled office assignment."
    />
  );
}
