"use client";

import { Alert, Card, Empty, Spin } from "antd";

import InspectionBrowser from "@/components/inspection-browser";
import InspectionRouteShell from "@/components/inspection-route-shell";
import InfraInspectOverviewPanel from "@/components/infrainspect-overview-panel";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";
import { getApiErrorMessage } from "@/lib/api/http";

const INFRAINSPECT_MODULE_CODE = "INFRA";

export default function InfraInspectBrowser() {
  const { accessToken } = useAuthSession();
  const { moduleQuery, officeModulesQuery } = useModuleWorkspace({
    accessToken: accessToken ?? "",
    moduleCode: INFRAINSPECT_MODULE_CODE,
  });

  const assignedOffice = officeModulesQuery.data?.data?.[0]?.office;

  if (moduleQuery.isLoading || officeModulesQuery.isLoading) {
    return (
      <InspectionRouteShell
        eyebrow="InfraInspect operations"
        title="InfraInspect Pro"
        description="Loading the office assignment for the InfraInspect inspection workspace."
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
        eyebrow="InfraInspect operations"
        title="InfraInspect Pro"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the InfraInspect module."
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
        eyebrow="InfraInspect operations"
        title="InfraInspect Pro"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the InfraInspect module."
      >
        <Card className="glass-card dashboard-data-card">
          <Empty description="No InfraInspect office assignments found yet" />
        </Card>
      </InspectionRouteShell>
    );
  }

  return (
    <InspectionBrowser
      beforeContent={
        <InfraInspectOverviewPanel
          accessToken={accessToken ?? ""}
          officeId={assignedOffice.id}
          officeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
        />
      }
      description="Run InfraInspect infrastructure compliance inspections through the shared core queue, scoped to the InfraInspect-enabled office assignment."
      eyebrow="InfraInspect operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
      title="InfraInspect Pro"
    />
  );
}
