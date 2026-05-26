"use client";

import AgriCheckOverviewPanel from "@/components/agricheck-overview-panel";
import ModuleInspectionWorkspace from "@/components/module-inspection-workspace";

const AGRICHECK_MODULE_CODE = "AGRI";

export default function AgriCheckBrowser() {
  return (
    <ModuleInspectionWorkspace
      emptyAssignmentsDescription="No AgriCheck office assignments found yet"
      eyebrow="AgriCheck operations"
      loadingDescription="Loading the office assignment for the AgriCheck inspection workspace."
      moduleCode={AGRICHECK_MODULE_CODE}
      officeSelectAriaLabel="Select AgriCheck office assignment"
      renderSupplementalContent={({ accessToken, officeId, officeLabel }) => (
        <AgriCheckOverviewPanel
          accessToken={accessToken}
          officeId={officeId}
          officeLabel={officeLabel}
        />
      )}
      title="AgriCheck PH"
      workspaceDescription="Run AgriCheck agricultural compliance inspections through the shared core queue, scoped to the AgriCheck-enabled office assignment."
    />
  );
}
