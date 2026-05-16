"use client";

import { Alert, Card, Empty, Spin } from "antd";

import InspectionBrowser from "@/components/inspection-browser";
import InspectionRouteShell from "@/components/inspection-route-shell";
import AssessProOverviewPanel from "@/components/assesspro-overview-panel";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";
import { getApiErrorMessage } from "@/lib/api/http";

const ASSESSPRO_MODULE_CODE = "ASSESS";

export default function AssessProBrowser() {
  const { accessToken } = useAuthSession();
  const { moduleQuery, officeModulesQuery } = useModuleWorkspace({
    accessToken: accessToken ?? "",
    moduleCode: ASSESSPRO_MODULE_CODE,
  });

  const assignedOffice = officeModulesQuery.data?.data?.[0]?.office;

  if (moduleQuery.isLoading || officeModulesQuery.isLoading) {
    return (
      <InspectionRouteShell
        eyebrow="AssessPro operations"
        title="AssessPro LGU"
        description="Loading the office assignment for the AssessPro inspection workspace."
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
        eyebrow="AssessPro operations"
        title="AssessPro LGU"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the AssessPro module."
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
        eyebrow="AssessPro operations"
        title="AssessPro LGU"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the AssessPro module."
      >
        <Card className="glass-card dashboard-data-card">
          <Empty description="No AssessPro office assignments found yet" />
        </Card>
      </InspectionRouteShell>
    );
  }

  return (
    <InspectionBrowser
      beforeContent={
        <AssessProOverviewPanel
          accessToken={accessToken ?? ""}
          officeId={assignedOffice.id}
          officeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
        />
      }
      description="Run AssessPro property assessment and compliance inspections through the shared core queue, scoped to the AssessPro-enabled office assignment."
      eyebrow="AssessPro operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
      title="AssessPro LGU"
    />
  );
}
