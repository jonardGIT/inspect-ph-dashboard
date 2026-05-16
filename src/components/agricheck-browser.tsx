"use client";

import { Alert, Card, Empty, Spin } from "antd";

import InspectionBrowser from "@/components/inspection-browser";
import InspectionRouteShell from "@/components/inspection-route-shell";
import AgriCheckOverviewPanel from "@/components/agricheck-overview-panel";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";
import { getApiErrorMessage } from "@/lib/api/http";

const AGRICHECK_MODULE_CODE = "AGRI";

export default function AgriCheckBrowser() {
  const { accessToken } = useAuthSession();
  const { moduleQuery, officeModulesQuery } = useModuleWorkspace({
    accessToken: accessToken ?? "",
    moduleCode: AGRICHECK_MODULE_CODE,
  });

  const assignedOffice = officeModulesQuery.data?.data?.[0]?.office;

  if (moduleQuery.isLoading || officeModulesQuery.isLoading) {
    return (
      <InspectionRouteShell
        eyebrow="AgriCheck operations"
        title="AgriCheck PH"
        description="Loading the office assignment for the AgriCheck inspection workspace."
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
        eyebrow="AgriCheck operations"
        title="AgriCheck PH"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the AgriCheck module."
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
        eyebrow="AgriCheck operations"
        title="AgriCheck PH"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the AgriCheck module."
      >
        <Card className="glass-card dashboard-data-card">
          <Empty description="No AgriCheck office assignments found yet" />
        </Card>
      </InspectionRouteShell>
    );
  }

  return (
    <InspectionBrowser
      beforeContent={
        <AgriCheckOverviewPanel
          accessToken={accessToken ?? ""}
          officeId={assignedOffice.id}
          officeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
        />
      }
      description="Run AgriCheck agricultural compliance inspections through the shared core queue, scoped to the AgriCheck-enabled office assignment."
      eyebrow="AgriCheck operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
      title="AgriCheck PH"
    />
  );
}
