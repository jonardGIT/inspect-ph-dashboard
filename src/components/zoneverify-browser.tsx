"use client";

import ZoneVerifyOverviewPanel from "@/components/zoneverify-overview-panel";
import ModuleInspectionWorkspace from "@/components/module-inspection-workspace";

const ZONEVERIFY_MODULE_CODE = "ZONE";

export default function ZoneVerifyBrowser() {
  return (
    <ModuleInspectionWorkspace
      emptyAssignmentsDescription="No ZoneVerify office assignments found yet"
      eyebrow="ZoneVerify operations"
      loadingDescription="Loading the office assignment for the ZoneVerify inspection workspace."
      moduleCode={ZONEVERIFY_MODULE_CODE}
      officeSelectAriaLabel="Select ZoneVerify office assignment"
      renderSupplementalContent={({ accessToken, officeId, officeLabel }) => (
        <ZoneVerifyOverviewPanel
          accessToken={accessToken}
          officeId={officeId}
          officeLabel={officeLabel}
        />
      )}
      title="ZoneVerify"
      workspaceDescription="Run ZoneVerify zoning compliance inspections through the shared core queue, scoped to the ZoneVerify-enabled office assignment."
    />
  );
}
