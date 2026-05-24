"use client";

import { useState } from "react";
import { Alert, Card, Empty, Select, Spin } from "antd";

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

  const officeLabel = `${assignedOffice.name} · ${assignedOffice.code}`;

  return (
    <InspectionBrowser
      beforeContent={
        <>
          {assignedOffices.length > 1 && (
            <Select
              aria-label="Select AgriCheck office assignment"
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
          <AgriCheckOverviewPanel
            accessToken={accessToken ?? ""}
            officeId={assignedOffice.id}
            officeLabel={officeLabel}
          />
        </>
      }
      description="Run AgriCheck agricultural compliance inspections through the shared core queue, scoped to the AgriCheck-enabled office assignment."
      eyebrow="AgriCheck operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={officeLabel}
      title="AgriCheck PH"
    />
  );
}
