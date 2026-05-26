"use client";

import InfraInspectOverviewPanel from "@/components/infrainspect-overview-panel";
import ModuleInspectionWorkspace from "@/components/module-inspection-workspace";

const INFRAINSPECT_MODULE_CODE = "INFRA";

export default function InfraInspectBrowser() {
  return (
    <ModuleInspectionWorkspace
      emptyAssignmentsDescription="No InfraInspect office assignments found yet"
      eyebrow="InfraInspect operations"
      loadingDescription="Loading the office assignment for the InfraInspect inspection workspace."
      moduleCode={INFRAINSPECT_MODULE_CODE}
      officeSelectAriaLabel="Select InfraInspect office assignment"
      renderSupplementalContent={({ accessToken, officeId, officeLabel }) => (
        <InfraInspectOverviewPanel
          accessToken={accessToken}
          officeId={officeId}
          officeLabel={officeLabel}
        />
      )}
      title="InfraInspect Pro"
      workspaceDescription="Run InfraInspect infrastructure compliance inspections through the shared core queue, scoped to the InfraInspect-enabled office assignment."
    />
  );
}
