"use client";

import AssessProOverviewPanel from "@/components/assesspro-overview-panel";
import ModuleInspectionWorkspace from "@/components/module-inspection-workspace";

const ASSESSPRO_MODULE_CODE = "ASSESS";

export default function AssessProBrowser() {
  return (
    <ModuleInspectionWorkspace
      emptyAssignmentsDescription="No AssessPro office assignments found yet"
      eyebrow="AssessPro operations"
      loadingDescription="Loading the office assignment for the AssessPro inspection workspace."
      moduleCode={ASSESSPRO_MODULE_CODE}
      officeSelectAriaLabel="Select AssessPro office assignment"
      renderSupplementalContent={({ accessToken, officeId, officeLabel }) => (
        <AssessProOverviewPanel
          accessToken={accessToken}
          officeId={officeId}
          officeLabel={officeLabel}
        />
      )}
      title="AssessPro LGU"
      workspaceDescription="Run AssessPro property assessment and compliance inspections through the shared core queue, scoped to the AssessPro-enabled office assignment."
    />
  );
}
