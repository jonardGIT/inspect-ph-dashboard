"use client";

import SanitaCheckOverviewPanel from "@/components/sanitacheck-overview-panel";
import ModuleInspectionWorkspace from "@/components/module-inspection-workspace";

const SANITACHECK_MODULE_CODE = "SANITA";

export default function SanitaCheckBrowser() {
  return (
    <ModuleInspectionWorkspace
      emptyAssignmentsDescription="No SanitaCheck office assignments found yet"
      eyebrow="SanitaCheck operations"
      loadingDescription="Loading the office assignment for the SanitaCheck inspection workspace."
      moduleCode={SANITACHECK_MODULE_CODE}
      officeSelectAriaLabel="Select SanitaCheck office assignment"
      renderSupplementalContent={({ accessToken, officeId, officeLabel }) => (
        <SanitaCheckOverviewPanel
          accessToken={accessToken}
          officeId={officeId}
          officeLabel={officeLabel}
        />
      )}
      title="SanitaCheck"
      workspaceDescription="Run SanitaCheck inspections through the same core queue, metrics, and workspace flow already used for BPLO and FireGuard, but scoped to the SanitaCheck office assignment."
    />
  );
}
