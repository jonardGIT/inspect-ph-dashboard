"use client";

import Link from "next/link";
import {
  Alert,
  Card,
  Empty,
  Input,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableProps } from "antd";
import type { InspectionRecord } from "@shared/types/api";

import DashboardFilterStrip from "@/components/dashboard-filter-strip";
import DashboardMetricCard from "@/components/dashboard-metric-card";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { useInspectionBrowser } from "@/hooks/use-inspection-browser";
import { getApiErrorMessage } from "@/lib/api/http";

const statusOptions: {
  label: string;
  value: InspectionRecord["status"] | "all";
}[] = [
  { label: "All statuses", value: "all" },
  { label: "Scheduled", value: "scheduled" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Overdue", value: "overdue" },
  { label: "Canceled", value: "canceled" },
];

const statusColors: Record<InspectionRecord["status"], string> = {
  canceled: "default",
  completed: "green",
  in_progress: "blue",
  overdue: "red",
  scheduled: "gold",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatusLabel(value: InspectionRecord["status"] | "all") {
  const match = statusOptions.find((option) => option.value === value);

  return match?.label ?? value;
}

function getDateLabel(value: string) {
  if (!value) {
    return "Any time";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

export default function OperationsReport() {
  const { activeCount, clearValues, page, setPage, setValue, values } =
    useBrowserQueryParams({
      defaults: { status: "all" },
      keys: ["from", "status", "to"] as const,
    });
  const { accessToken, session } = useAuthSession();
  const isAdmin = session?.user.role === "admin";
  const status = values.status as InspectionRecord["status"] | "all";
  const from = values.from;
  const to = values.to;
  const { inspectionsQuery, summaryQuery } = useInspectionBrowser({
    accessToken,
    from: from ? new Date(`${from}T00:00:00.000Z`).toISOString() : undefined,
    page,
    status: status === "all" ? undefined : status,
    to: to ? new Date(`${to}T23:59:59.999Z`).toISOString() : undefined,
  });

  const inspections = inspectionsQuery.data?.data ?? [];
  const inspectionsMeta = inspectionsQuery.data?.meta;
  const summary = summaryQuery.data;
  const columns: TableProps<InspectionRecord>["columns"] = [
    {
      title: "Business",
      key: "business",
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>
            {record.business.businessName}
          </Typography.Text>
          <Typography.Text type="secondary">
            Permit {record.permit.permitNumber}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Scheduled",
      key: "scheduledAt",
      render: (_value, record) => formatDate(record.scheduledAt),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: InspectionRecord["status"]) => (
        <Tag color={statusColors[value]}>{formatStatusLabel(value)}</Tag>
      ),
    },
    {
      title: "Workspace",
      key: "workspace",
      render: (_value, record) => (
        <Link href={`/inspections/${record.id}`}>Open inspection</Link>
      ),
    },
  ];

  return (
    <InspectionRouteShell
      eyebrow="BPLO supervisory reporting"
      title="Operations report"
      description="Track inspection workload, completion, and exception pressure across a reporting window while keeping the live inspection queue close at hand."
    >
      {!accessToken ? null : !isAdmin ? (
        <Alert
          type="warning"
          showIcon
          message="Operations reports are limited to admins."
        />
      ) : (
        <>
          {activeCount ? (
            <DashboardFilterStrip onClear={clearValues}>
              {from ? <Tag color="blue">From: {getDateLabel(from)}</Tag> : null}
              {to ? <Tag color="blue">To: {getDateLabel(to)}</Tag> : null}
              {status !== "all" ? (
                <Tag color="gold">Status: {formatStatusLabel(status)}</Tag>
              ) : null}
            </DashboardFilterStrip>
          ) : null}

          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <Card className="glass-card dashboard-data-card">
              <Space
                align="start"
                size={12}
                style={{ justifyContent: "space-between", width: "100%" }}
                wrap
              >
                <Space direction="vertical" size={4}>
                  <Typography.Text strong>Reporting window</Typography.Text>
                  <Typography.Text type="secondary">
                    Summary cards respect the selected date range. Queue status
                    filters apply to the live inspection table below.
                  </Typography.Text>
                </Space>
                <Space size={12} wrap>
                  <Input
                    aria-label="Report from date"
                    placeholder="From"
                    style={{ width: 170 }}
                    type="date"
                    value={from}
                    onChange={(event) => setValue("from", event.target.value)}
                  />
                  <Input
                    aria-label="Report to date"
                    placeholder="To"
                    style={{ width: 170 }}
                    type="date"
                    value={to}
                    onChange={(event) => setValue("to", event.target.value)}
                  />
                  <Select
                    allowClear
                    aria-label="Queue status filter"
                    options={statusOptions
                      .filter((option) => option.value !== "all")
                      .map((option) => ({
                        label: option.label,
                        value: option.value,
                      }))}
                    style={{ width: 190 }}
                    placeholder="Filter queue status"
                    value={status === "all" ? undefined : status}
                    onChange={(value) => setValue("status", value ?? "")}
                  />
                </Space>
              </Space>
            </Card>

            {summaryQuery.error ? (
              <Alert
                type="error"
                showIcon
                message={getApiErrorMessage(summaryQuery.error)}
              />
            ) : null}

            <Space size={16} style={{ width: "100%" }} wrap>
              <DashboardMetricCard
                accent
                label="Total inspections"
                value={summary?.total ?? "--"}
                description="Across the reporting window"
              />
              <DashboardMetricCard
                label="Scheduled"
                value={summary?.scheduled ?? "--"}
                description="Upcoming field work"
              />
              <DashboardMetricCard
                label="In progress"
                value={summary?.inProgress ?? "--"}
                description="Active field visits"
              />
              <DashboardMetricCard
                label="Completed"
                value={summary?.completed ?? "--"}
                description="Closed inspection work"
              />
              <DashboardMetricCard
                label="Overdue"
                value={summary?.overdue ?? "--"}
                description="Needs supervisory attention"
              />
            </Space>

            {inspectionsQuery.error ? (
              <Alert
                type="error"
                showIcon
                message={getApiErrorMessage(inspectionsQuery.error)}
              />
            ) : null}

            <Card
              title="Live inspection queue"
              className="glass-card dashboard-data-card"
            >
              {inspectionsQuery.isLoading ? null : inspections.length ? (
                <>
                  <Table
                    className="dashboard-table"
                    columns={columns}
                    dataSource={inspections}
                    pagination={false}
                    rowKey="id"
                    scroll={{ x: true }}
                  />
                  {inspectionsMeta ? (
                    <Pagination
                      current={inspectionsMeta.page}
                      pageSize={inspectionsMeta.limit}
                      total={inspectionsMeta.total}
                      style={{ marginTop: 20 }}
                      onChange={(nextPage) => setPage(nextPage)}
                    />
                  ) : null}
                </>
              ) : (
                <Empty description="No inspections found for the current queue filter" />
              )}
            </Card>
          </Space>
        </>
      )}
    </InspectionRouteShell>
  );
}
