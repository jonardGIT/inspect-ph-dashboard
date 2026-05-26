"use client";

import BuildSureOverviewPanel from "@/components/buildsure-overview-panel";
import ModuleInspectionWorkspace from "@/components/module-inspection-workspace";

const BUILDSURE_MODULE_CODE = "BUILD";

export default function BuildSureBrowser() {
  return (
    <ModuleInspectionWorkspace
      emptyAssignmentsDescription="No BuildSure office assignments found yet"
      eyebrow="BuildSure operations"
      loadingDescription="Loading the office assignment for the BuildSure inspection workspace."
      moduleCode={BUILDSURE_MODULE_CODE}
      officeSelectAriaLabel="Select BuildSure office assignment"
      renderSupplementalContent={({ accessToken, officeId, officeLabel }) => (
        <BuildSureOverviewPanel
          accessToken={accessToken}
          officeId={officeId}
          officeLabel={officeLabel}
        />
      )}
      title="BuildSure PH"
      workspaceDescription="Run BuildSure inspections through the same core queue, metrics, and workspace flow already used for BPLO, FireGuard, and SanitaCheck, but scoped to the BuildSure office assignment."
    />
  );
}
