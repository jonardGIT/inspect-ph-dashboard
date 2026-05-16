"use client";

import { Alert, Card, Empty, Spin } from "antd";

import InspectionBrowser from "@/components/inspection-browser";
import InspectionRouteShell from "@/components/inspection-route-shell";
import ZoneVerifyOverviewPanel from "@/components/zoneverify-overview-panel";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";
import { getApiErrorMessage } from "@/lib/api/http";

const ZONEVERIFY_MODULE_CODE = "ZONE";

export default function ZoneVerifyBrowser() {
  const { accessToken } = useAuthSession();
  const { moduleQuery, officeModulesQuery } = useModuleWorkspace({
    accessToken: accessToken ?? "",
    moduleCode: ZONEVERIFY_MODULE_CODE,
  });

  const assignedOffice = officeModulesQuery.data?.data?.[0]?.office;

  if (moduleQuery.isLoading || officeModulesQuery.isLoading) {
    return (
      <InspectionRouteShell
        eyebrow="ZoneVerify operations"
        title="ZoneVerify"
        description="Loading the office assignment for the ZoneVerify inspection workspace."
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
        eyebrow="ZoneVerify operations"
        title="ZoneVerify"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the ZoneVerify module."
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
        eyebrow="ZoneVerify operations"
        title="ZoneVerify"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the ZoneVerify module."
      >
        <Card className="glass-card dashboard-data-card">
          <Empty description="No ZoneVerify office assignments found yet" />
        </Card>
      </InspectionRouteShell>
    );
  }

  return (
    <InspectionBrowser
      beforeContent={
        <ZoneVerifyOverviewPanel
          accessToken={accessToken ?? ""}
          officeId={assignedOffice.id}
          officeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
        />
      }
      description="Run ZoneVerify zoning compliance inspections through the shared core queue, scoped to the ZoneVerify-enabled office assignment."
      eyebrow="ZoneVerify operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
      title="ZoneVerify"
    />
  );
}
