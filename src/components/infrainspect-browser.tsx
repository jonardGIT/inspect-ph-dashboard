"use client";

import { useState } from "react";
import { Alert, Card, Empty, Select, Spin } from "antd";

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

  if (!moduleQuery.data || assignedOffices.length === 0) {
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

  const officeLabel = `${assignedOffice.name} · ${assignedOffice.code}`;

  return (
    <InspectionBrowser
      beforeContent={
        <>
          {assignedOffices.length > 1 && (
            <Select
              value={assignedOffice.id}
              onChange={setSelectedOfficeId}
              options={assignedOffices.map((o) => ({
                label: `${o.name} · ${o.code}`,
                value: o.id,
              }))}
              style={{ marginBottom: 16, width: "100%" }}
            />
          )}
          <InfraInspectOverviewPanel
            accessToken={accessToken ?? ""}
            officeId={assignedOffice.id}
            officeLabel={officeLabel}
          />
        </>
      }
      description="Run InfraInspect infrastructure compliance inspections through the shared core queue, scoped to the InfraInspect-enabled office assignment."
      eyebrow="InfraInspect operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={officeLabel}
      title="InfraInspect Pro"
    />
  );
}
