"use client";

import { Alert, Card, Empty, Spin } from "antd";

import InspectionBrowser from "@/components/inspection-browser";
import InspectionRouteShell from "@/components/inspection-route-shell";
import TourismSafeOverviewPanel from "@/components/tourismsafe-overview-panel";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";
import { getApiErrorMessage } from "@/lib/api/http";

const TOURISMSAFE_MODULE_CODE = "TOURISM";

export default function TourismSafeBrowser() {
  const { accessToken } = useAuthSession();
  const { moduleQuery, officeModulesQuery } = useModuleWorkspace({
    accessToken: accessToken ?? "",
    moduleCode: TOURISMSAFE_MODULE_CODE,
  });

  const assignedOffice = officeModulesQuery.data?.data?.[0]?.office;

  if (moduleQuery.isLoading || officeModulesQuery.isLoading) {
    return (
      <InspectionRouteShell
        eyebrow="TourismSafe operations"
        title="TourismSafe Check"
        description="Loading the office assignment for the TourismSafe inspection workspace."
      >
        <Card className="glass-card dashboard-data-card">
          <Spin size="large" />
        </Card>
      </InspectionRouteShell>
    );
  }

  if (moduleQuery.error || officeModulesQuery.error) {
    return (
      <InspectionRouteShell
        eyebrow="TourismSafe operations"
        title="TourismSafe Check"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the TourismSafe module."
      >
        <Alert
          type="error"
          showIcon
          message={getApiErrorMessage(
            moduleQuery.error || officeModulesQuery.error,
          )}
        />
      </InspectionRouteShell>
    );
  }

  if (!moduleQuery.data || !assignedOffice) {
    return (
      <InspectionRouteShell
        eyebrow="TourismSafe operations"
        title="TourismSafe Check"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the TourismSafe module."
      >
        <Card className="glass-card dashboard-data-card">
          <Empty description="No TourismSafe office assignments found yet" />
        </Card>
      </InspectionRouteShell>
    );
  }

  return (
    <InspectionBrowser
      beforeContent={
        <TourismSafeOverviewPanel
          accessToken={accessToken ?? ""}
          officeId={assignedOffice.id}
          officeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
        />
      }
      description="Run TourismSafe hospitality and tourism compliance inspections through the shared core queue, scoped to the TourismSafe-enabled office assignment."
      eyebrow="TourismSafe operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
      title="TourismSafe Check"
    />
  );
}
