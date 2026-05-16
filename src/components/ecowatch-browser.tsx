"use client";

import { Alert, Card, Empty, Spin } from "antd";

import InspectionBrowser from "@/components/inspection-browser";
import InspectionRouteShell from "@/components/inspection-route-shell";
import EcoWatchOverviewPanel from "@/components/ecowatch-overview-panel";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";
import { getApiErrorMessage } from "@/lib/api/http";

const ECOWATCH_MODULE_CODE = "ECOWATCH";

export default function EcoWatchBrowser() {
  const { accessToken } = useAuthSession();
  const { moduleQuery, officeModulesQuery } = useModuleWorkspace({
    accessToken: accessToken ?? "",
    moduleCode: ECOWATCH_MODULE_CODE,
  });

  const assignedOffice = officeModulesQuery.data?.data?.[0]?.office;

  if (moduleQuery.isLoading || officeModulesQuery.isLoading) {
    return (
      <InspectionRouteShell
        eyebrow="EcoWatch operations"
        title="EcoWatch LGU"
        description="Loading the office assignment for the EcoWatch inspection workspace."
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
        eyebrow="EcoWatch operations"
        title="EcoWatch LGU"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the EcoWatch module."
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
        eyebrow="EcoWatch operations"
        title="EcoWatch LGU"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the EcoWatch module."
      >
        <Card className="glass-card dashboard-data-card">
          <Empty description="No EcoWatch office assignments found yet" />
        </Card>
      </InspectionRouteShell>
    );
  }

  return (
    <InspectionBrowser
      beforeContent={
        <EcoWatchOverviewPanel
          accessToken={accessToken ?? ""}
          officeId={assignedOffice.id}
          officeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
        />
      }
      description="Run EcoWatch environmental inspections through the shared core queue, scoped to the EcoWatch-enabled office assignment."
      eyebrow="EcoWatch operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
      title="EcoWatch LGU"
    />
  );
}
