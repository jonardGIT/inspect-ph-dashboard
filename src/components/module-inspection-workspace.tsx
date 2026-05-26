"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Alert, Card, Empty, Select, Spin } from "antd";

import InspectionBrowser from "@/components/inspection-browser";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";
import { getApiErrorMessage } from "@/lib/api/http";

interface ModuleInspectionWorkspaceProps {
  emptyAssignmentsDescription: string;
  eyebrow: string;
  loadingDescription: string;
  moduleCode: string;
  officeSelectAriaLabel?: string;
  officeSelectPlaceholder?: string;
  renderSupplementalContent?: (input: {
    accessToken: string;
    officeId: string;
    officeLabel: string;
  }) => ReactNode;
  title: string;
  workspaceDescription: string;
}

export default function ModuleInspectionWorkspace({
  emptyAssignmentsDescription,
  eyebrow,
  loadingDescription,
  moduleCode,
  officeSelectAriaLabel,
  officeSelectPlaceholder = "Select office",
  renderSupplementalContent,
  title,
  workspaceDescription,
}: ModuleInspectionWorkspaceProps) {
  const { accessToken } = useAuthSession();
  const { moduleQuery, officeModulesQuery } = useModuleWorkspace({
    accessToken: accessToken ?? "",
    moduleCode,
  });

  const assignedOffices =
    officeModulesQuery.data?.data?.map((assignment) => assignment.office) ?? [];
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>();
  const assignedOffice = useMemo(
    () =>
      assignedOffices.find(
        (office) => office.id === (selectedOfficeId ?? assignedOffices[0]?.id),
      ) ?? assignedOffices[0],
    [assignedOffices, selectedOfficeId],
  );

  if (moduleQuery.isLoading || officeModulesQuery.isLoading) {
    return (
      <InspectionRouteShell
        eyebrow={eyebrow}
        title={title}
        description={loadingDescription}
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
        eyebrow={eyebrow}
        title={title}
        description={workspaceDescription}
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

  if (!moduleQuery.data || !assignedOffice) {
    return (
      <InspectionRouteShell
        eyebrow={eyebrow}
        title={title}
        description={workspaceDescription}
      >
        <Card className="glass-card dashboard-data-card">
          <Empty description={emptyAssignmentsDescription} />
        </Card>
      </InspectionRouteShell>
    );
  }

  const officeLabel = `${assignedOffice.name} · ${assignedOffice.code}`;
  const supplementalContent = renderSupplementalContent?.({
    accessToken: accessToken ?? "",
    officeId: assignedOffice.id,
    officeLabel,
  });
  const officeSelector =
    assignedOffices.length > 1 ? (
      <Select
        aria-label={officeSelectAriaLabel}
        value={assignedOffice.id}
        onChange={setSelectedOfficeId}
        options={assignedOffices.map((office) => ({
          label: `${office.name} · ${office.code}`,
          value: office.id,
        }))}
        placeholder={officeSelectPlaceholder}
        style={{ marginBottom: 16, width: "100%" }}
      />
    ) : null;
  const beforeContent =
    officeSelector || supplementalContent ? (
      <>
        {officeSelector}
        {supplementalContent}
      </>
    ) : undefined;

  return (
    <InspectionBrowser
      beforeContent={beforeContent}
      description={workspaceDescription}
      eyebrow={eyebrow}
      lockedOfficeId={assignedOffice.id}
      lockedOfficeLabel={officeLabel}
      title={title}
    />
  );
}
