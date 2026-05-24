"use client";

import { useState } from "react";
import { Alert, Card, Empty, Select, Spin } from "antd";

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
        <>
          {assignedOffices.length > 1 && (
            <Select
              aria-label="Select SanitaCheck office assignment"
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
          <SanitaCheckOverviewPanel
            accessToken={accessToken ?? ""}
            officeId={assignedOffice.id}
            officeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
          />
        </>
      }
      description="Run SanitaCheck inspections through the same core queue, metrics, and workspace flow already used for BPLO and FireGuard, but scoped to the SanitaCheck office assignment."
      eyebrow="SanitaCheck operations"
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={`${assignedOffice.name} · ${assignedOffice.code}`}
      title="SanitaCheck"
    />
  );
}
