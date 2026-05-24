"use client";

import { useState } from "react";
import { Alert, Card, Empty, Select, Spin } from "antd";

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

  const assignedOffices =
    officeModulesQuery.data?.data?.map((m) => m.office) ?? [];
  const [selectedOfficeId, setSelectedOfficeId] = useState<
    string | undefined
  >();
  const assignedOffice =
    assignedOffices.find(
      (o) => o.id === (selectedOfficeId ?? assignedOffices[0]?.id),
    ) ?? assignedOffices[0];

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
          title={getApiErrorMessage(
            moduleQuery.error || officeModulesQuery.error,
          )}
        />
      </InspectionRouteShell>
    );
  }

  if (!moduleQuery.data || assignedOffices.length === 0) {
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

  const officeLabel = `${assignedOffice.name} · ${assignedOffice.code}`;

  return (
    <InspectionBrowser
      beforeContent={
        <>
          {assignedOffices.length > 1 && (
            <Select
              aria-label="Select AssessPro office assignment"
              value={assignedOffice.id}
              onChange={setSelectedOfficeId}
              options={assignedOffices.map((o) => ({
                label: `${o.name} · ${o.code}`,
                value: o.id,
              }))}
              placeholder="Select office"
              style={{ marginBottom: 16, width: "100%" }}
            />
          )}
          <AssessProOverviewPanel
            accessToken={accessToken ?? ""}
            officeId={assignedOffice.id}
            officeLabel={officeLabel}
          />
        </>
      }
      description="Run AssessPro property assessment and compliance inspections through the shared core queue, scoped to the AssessPro-enabled office assignment."
      eyebrow="AssessPro operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={officeLabel}
      title="AssessPro LGU"
    />
  );
}
