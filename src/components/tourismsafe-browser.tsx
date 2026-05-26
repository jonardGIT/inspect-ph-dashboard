"use client";

import TourismSafeOverviewPanel from "@/components/tourismsafe-overview-panel";
import ModuleInspectionWorkspace from "@/components/module-inspection-workspace";

const TOURISMSAFE_MODULE_CODE = "TOURISM";

export default function TourismSafeBrowser() {
  return (
    <ModuleInspectionWorkspace
      emptyAssignmentsDescription="No TourismSafe office assignments found yet"
      eyebrow="TourismSafe operations"
      loadingDescription="Loading the office assignment for the TourismSafe inspection workspace."
      moduleCode={TOURISMSAFE_MODULE_CODE}
      officeSelectAriaLabel="Select TourismSafe office assignment"
      renderSupplementalContent={({ accessToken, officeId, officeLabel }) => (
        <TourismSafeOverviewPanel
          accessToken={accessToken}
          officeId={officeId}
          officeLabel={officeLabel}
        />
      )}
      title="TourismSafe Check"
      workspaceDescription="Run TourismSafe hospitality and tourism compliance inspections through the shared core queue, scoped to the TourismSafe-enabled office assignment."
    />
  );
}
