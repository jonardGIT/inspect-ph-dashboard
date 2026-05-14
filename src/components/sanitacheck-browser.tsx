"use client";

import { Alert, Card, Empty, Spin } from "antd";

import InspectionBrowser from "@/components/inspection-browser";
import InspectionRouteShell from "@/components/inspection-route-shell";
import SanitaCheckOverviewPanel from "@/components/sanitacheck-overview-panel";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";
import { getApiErrorMessage } from "@/lib/api/http";

const SANITACHECK_MODULE_CODE = "SANITA";

export default function SanitaCheckBrowser() {
  const { accessToken } = useAuthSession();
  const { moduleQuery, officeModulesQuery } = useModuleWorkspace({
    accessToken: accessToken ?? "",
    moduleCode: SANITACHECK_MODULE_CODE,
  });

  const assignedOffice = officeModulesQuery.data?.data?.[0]?.office;

  if (moduleQuery.isLoading || officeModulesQuery.isLoading) {
    return (
      <InspectionRouteShell
        eyebrow="SanitaCheck operations"
        title="SanitaCheck"
        description="Loading the office assignment for the SanitaCheck inspection workspace."
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
        eyebrow="SanitaCheck operations"
        title="SanitaCheck"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the SanitaCheck module."
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
        eyebrow="SanitaCheck operations"
        title="SanitaCheck"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the SanitaCheck module."
      >
        <Card className="glass-card dashboard-data-card">
          <Empty description="No SanitaCheck office assignments found yet" />
        </Card>
      </InspectionRouteShell>
    );
  }

  return (
    <InspectionBrowser
      beforeContent={
        <SanitaCheckOverviewPanel
          accessToken={accessToken ?? ""}
          officeId={assignedOffice.id}
          officeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
        />
      }
      description="Run SanitaCheck inspections through the same core queue, metrics, and workspace flow already used for BPLO and FireGuard, but scoped to the SanitaCheck office assignment."
      eyebrow="SanitaCheck operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
      title="SanitaCheck"
    />
  );
}
