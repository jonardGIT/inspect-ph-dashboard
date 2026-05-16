"use client";

import { Alert, Card, Empty, Spin } from "antd";

import InspectionBrowser from "@/components/inspection-browser";
import InspectionRouteShell from "@/components/inspection-route-shell";
import MarketGuardOverviewPanel from "@/components/marketguard-overview-panel";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";
import { getApiErrorMessage } from "@/lib/api/http";

const MARKETGUARD_MODULE_CODE = "MARKET";

export default function MarketGuardBrowser() {
  const { accessToken } = useAuthSession();
  const { moduleQuery, officeModulesQuery } = useModuleWorkspace({
    accessToken: accessToken ?? "",
    moduleCode: MARKETGUARD_MODULE_CODE,
  });

  const assignedOffice = officeModulesQuery.data?.data?.[0]?.office;

  if (moduleQuery.isLoading || officeModulesQuery.isLoading) {
    return (
      <InspectionRouteShell
        eyebrow="MarketGuard operations"
        title="MarketGuard"
        description="Loading the office assignment for the MarketGuard inspection workspace."
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
        eyebrow="MarketGuard operations"
        title="MarketGuard"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the MarketGuard module."
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
        eyebrow="MarketGuard operations"
        title="MarketGuard"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the MarketGuard module."
      >
        <Card className="glass-card dashboard-data-card">
          <Empty description="No MarketGuard office assignments found yet" />
        </Card>
      </InspectionRouteShell>
    );
  }

  return (
    <InspectionBrowser
      beforeContent={
        <MarketGuardOverviewPanel
          accessToken={accessToken ?? ""}
          officeId={assignedOffice.id}
          officeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
        />
      }
      description="Run MarketGuard inspections through the same core queue, metrics, and workspace flow already used for BPLO, FireGuard, SanitaCheck, and BuildSure, but scoped to the MarketGuard office assignment."
      eyebrow="MarketGuard operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
      title="MarketGuard"
    />
  );
}
