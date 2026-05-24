"use client";

import { useState } from "react";
import { Alert, Card, Empty, Select, Spin } from "antd";

import InspectionBrowser from "@/components/inspection-browser";
import InspectionRouteShell from "@/components/inspection-route-shell";
import ZoneVerifyOverviewPanel from "@/components/zoneverify-overview-panel";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";
import { getApiErrorMessage } from "@/lib/api/http";

const ZONEVERIFY_MODULE_CODE = "ZONE";

export default function ZoneVerifyBrowser() {
  const { accessToken } = useAuthSession();
  const { moduleQuery, officeModulesQuery } = useModuleWorkspace({
    accessToken: accessToken ?? "",
    moduleCode: ZONEVERIFY_MODULE_CODE,
  });

  const assignedOffices =
    officeModulesQuery.data?.data?.map((assignment) => assignment.office) ?? [];
  const [selectedOfficeId, setSelectedOfficeId] = useState<
    string | undefined
  >();
  const assignedOffice =
    assignedOffices.find(
      (office) => office.id === (selectedOfficeId ?? assignedOffices[0]?.id),
    ) ?? assignedOffices[0];

  if (moduleQuery.isLoading || officeModulesQuery.isLoading) {
    return (
      <InspectionRouteShell
        eyebrow="ZoneVerify operations"
        title="ZoneVerify"
        description="Loading the office assignment for the ZoneVerify inspection workspace."
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
        eyebrow="ZoneVerify operations"
        title="ZoneVerify"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the ZoneVerify module."
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
        eyebrow="ZoneVerify operations"
        title="ZoneVerify"
        description="This workspace reuses the generic inspection queue, but narrows it to offices assigned to the ZoneVerify module."
      >
        <Card className="glass-card dashboard-data-card">
          <Empty description="No ZoneVerify office assignments found yet" />
        </Card>
      </InspectionRouteShell>
    );
  }

  return (
    <InspectionBrowser
      beforeContent={
        <>
          {assignedOffices.length > 1 && (
            <Select
              aria-label="Select ZoneVerify office assignment"
              value={assignedOffice.id}
              onChange={setSelectedOfficeId}
              options={assignedOffices.map((office) => ({
                label: `${office.name} · ${office.code}`,
                value: office.id,
              }))}
              placeholder="Select office"
              style={{ marginBottom: 16, width: "100%" }}
            />
          )}
          <ZoneVerifyOverviewPanel
            accessToken={accessToken ?? ""}
            officeId={assignedOffice.id}
            officeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
          />
        </>
      }
      description="Run ZoneVerify zoning compliance inspections through the shared core queue, scoped to the ZoneVerify-enabled office assignment."
      eyebrow="ZoneVerify operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
      title="ZoneVerify"
    />
  );
}
