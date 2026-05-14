"use client";

import { Alert, Card, Empty, Spin } from "antd";

import InspectionBrowser from "@/components/inspection-browser";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";
import { getApiErrorMessage } from "@/lib/api/http";

const BUILDSURE_MODULE_CODE = "BUILD";

export default function BuildSureBrowser() {
  const { accessToken } = useAuthSession();
  const { moduleQuery, officeModulesQuery } = useModuleWorkspace({
    accessToken: accessToken ?? "",
    moduleCode: BUILDSURE_MODULE_CODE,
  });

  const assignedOffice = officeModulesQuery.data?.data?.[0]?.office;

  if (moduleQuery.isLoading || officeModulesQuery.isLoading) {
    return (
      <InspectionRouteShell
        eyebrow="BuildSure operations"
        title="BuildSure PH"
        description="Loading the office assignment for the BuildSure inspection workspace."
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
        eyebrow="BuildSure operations"
        title="BuildSure PH"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the BuildSure module."
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
        eyebrow="BuildSure operations"
        title="BuildSure PH"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the BuildSure module."
      >
        <Card className="glass-card dashboard-data-card">
          <Empty description="No BuildSure office assignments found yet" />
        </Card>
      </InspectionRouteShell>
    );
  }

  return (
    <InspectionBrowser
      description="Run BuildSure inspections through the same core queue, metrics, and workspace flow already used for BPLO, FireGuard, and SanitaCheck, but scoped to the BuildSure office assignment."
      eyebrow="BuildSure operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
      title="BuildSure PH"
    />
  );
}
