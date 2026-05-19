"use client";

import { useState } from "react";
import { Alert, Card, Empty, Select, Spin } from "antd";

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

  if (!moduleQuery.data || assignedOffices.length === 0) {
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
          <EcoWatchOverviewPanel
            accessToken={accessToken ?? ""}
            officeId={assignedOffice.id}
            officeLabel={officeLabel}
          />
        </>
      }
      description="Run EcoWatch environmental inspections through the shared core queue, scoped to the EcoWatch-enabled office assignment."
      eyebrow="EcoWatch operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={officeLabel}
      title="EcoWatch LGU"
    />
  );
}
