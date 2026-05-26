"use client";

import FireSafetyCertificatePanel from "@/components/fire-safety-certificate-panel";
import ModuleInspectionWorkspace from "@/components/module-inspection-workspace";

const FIREGUARD_MODULE_CODE = "FIRE";

export default function FireGuardBrowser() {
  return (
    <ModuleInspectionWorkspace
      emptyAssignmentsDescription="No FireGuard office assignments found yet"
      eyebrow="FireGuard operations"
      loadingDescription="Loading the office assignment for the FireGuard inspection workspace."
      moduleCode={FIREGUARD_MODULE_CODE}
      renderSupplementalContent={({ accessToken, officeId, officeLabel }) => (
        <FireSafetyCertificatePanel
          accessToken={accessToken}
          officeId={officeId}
          officeLabel={officeLabel}
        />
      )}
      title="FireGuard Inspect"
      workspaceDescription="Run FireGuard inspections through the same core queue, metrics, and workspace flow already used for BPLO, but scoped to the FireGuard office assignment."
    />
  );
}
