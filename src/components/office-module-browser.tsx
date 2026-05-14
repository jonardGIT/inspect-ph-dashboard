"use client";

import {
  Alert,
  Button,
  Card,
  Empty,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";

import DashboardFilterStrip from "@/components/dashboard-filter-strip";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { useOfficeModuleBrowser } from "@/hooks/use-office-module-browser";
import { getApiErrorMessage } from "@/lib/api/http";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function OfficeModuleBrowser() {
  const { activeCount, clearValues, page, setPage, setValue, values } =
    useBrowserQueryParams({ keys: ["officeId", "moduleId"] as const });
  const { accessToken, session } = useAuthSession();
  const officeId = values.officeId;
  const moduleId = values.moduleId;
  const {
    createOfficeModuleMutation,
    deleteOfficeModuleMutation,
    modulesQuery,
    officeModulesQuery,
    officesQuery,
  } = useOfficeModuleBrowser({
    accessToken,
    moduleId: moduleId || undefined,
    officeId: officeId || undefined,
    page,
  });

  const offices = officesQuery.data?.data ?? [];
  const modules = modulesQuery.data?.data ?? [];
  const assignments = officeModulesQuery.data?.data ?? [];
  const meta = officeModulesQuery.data?.meta;
  const activeOfficeLabel =
    offices.find((item) => item.id === officeId)?.name || officeId;
  const activeModuleLabel =
    modules.find((item) => item.id === moduleId)?.name || moduleId;

  return (
    <InspectionRouteShell
      eyebrow="Platform administration"
      title="Office modules"
      description="Enable specific module overlays for specific offices so later role and scope rules can operate against concrete office capabilities."
      secondarySidebar={
        <Card title="Filters" className="glass-card dashboard-side-card">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Select
              allowClear
              placeholder="Filter by office"
              options={offices.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              value={officeId || undefined}
              onChange={(value) => setValue("officeId", value ?? "")}
            />
            <Select
              allowClear
              placeholder="Filter by module"
              options={modules.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              value={moduleId || undefined}
              onChange={(value) => setValue("moduleId", value ?? "")}
            />
            {activeCount ? (
              <Button onClick={clearValues}>Clear filters</Button>
            ) : null}
          </Space>
        </Card>
      }
    >
      {activeCount ? (
        <DashboardFilterStrip onClear={clearValues}>
          {activeOfficeLabel ? (
            <Tag color="blue">Office: {activeOfficeLabel}</Tag>
          ) : null}
          {activeModuleLabel ? (
            <Tag color="gold">Module: {activeModuleLabel}</Tag>
          ) : null}
        </DashboardFilterStrip>
      ) : null}

      {officeModulesQuery.error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          message={getApiErrorMessage(officeModulesQuery.error)}
        />
      ) : null}

      <Card
        title="Office module matrix"
        className="glass-card dashboard-data-card"
        style={{ marginBottom: 20 }}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {session?.user.role === "admin" ? (
            <Space wrap>
              <Select
                showSearch
                placeholder="Select office"
                style={{ minWidth: 240 }}
                options={offices.map((item) => ({
                  label: `${item.name} · ${item.code}`,
                  value: item.id,
                }))}
                onChange={(value) => {
                  if (!value) {
                    return;
                  }

                  const currentModuleId = moduleId || modules[0]?.id;

                  if (!currentModuleId) {
                    return;
                  }

                  createOfficeModuleMutation.mutate({
                    moduleId: currentModuleId,
                    officeId: value,
                  });
                }}
              />
              <Select
                showSearch
                placeholder="Select module"
                style={{ minWidth: 240 }}
                options={modules.map((item) => ({
                  label: `${item.name} · ${item.code}`,
                  value: item.id,
                }))}
                onChange={(value) => {
                  if (!value) {
                    return;
                  }

                  const currentOfficeId = officeId || offices[0]?.id;

                  if (!currentOfficeId) {
                    return;
                  }

                  createOfficeModuleMutation.mutate({
                    moduleId: value,
                    officeId: currentOfficeId,
                  });
                }}
              />
            </Space>
          ) : null}
          {createOfficeModuleMutation.error ? (
            <Alert
              type="error"
              showIcon
              message={getApiErrorMessage(createOfficeModuleMutation.error)}
            />
          ) : null}
          {deleteOfficeModuleMutation.error ? (
            <Alert
              type="error"
              showIcon
              message={getApiErrorMessage(deleteOfficeModuleMutation.error)}
            />
          ) : null}
          {officeModulesQuery.isLoading ? null : assignments.length ? (
            <>
              <Table
                className="dashboard-table"
                dataSource={assignments}
                pagination={false}
                rowKey="id"
                scroll={{ x: true }}
                columns={[
                  {
                    title: "Office",
                    key: "office",
                    render: (_value, record) =>
                      `${record.office.name} · ${record.office.code}`,
                  },
                  {
                    title: "Module",
                    key: "module",
                    render: (_value, record) => (
                      <Space>
                        <Typography.Text>{record.module.name}</Typography.Text>
                        {!record.module.isActive ? <Tag>inactive</Tag> : null}
                      </Space>
                    ),
                  },
                  {
                    title: "Created",
                    key: "createdAt",
                    render: (_value, record) => formatDate(record.createdAt),
                  },
                  {
                    title: "Actions",
                    key: "actions",
                    render: (_value, record) => (
                      <Button
                        danger
                        disabled={deleteOfficeModuleMutation.isPending}
                        onClick={() =>
                          deleteOfficeModuleMutation.mutate({
                            assignmentId: record.id,
                          })
                        }
                      >
                        Remove
                      </Button>
                    ),
                  },
                ]}
              />
              {meta ? (
                <Pagination
                  current={meta.page}
                  pageSize={meta.limit}
                  total={meta.total}
                  style={{ marginTop: 20 }}
                  onChange={(nextPage) => setPage(nextPage)}
                />
              ) : null}
            </>
          ) : (
            <Empty description="No office module assignments found for the current filters" />
          )}
        </Space>
      </Card>
    </InspectionRouteShell>
  );
}
