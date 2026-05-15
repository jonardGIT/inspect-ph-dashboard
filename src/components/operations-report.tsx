"use client";

import Link from "next/link";
import { useState } from "react";
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
import type { InspectionMapPoint, InspectionRecord } from "@shared/types/api";

import DashboardFilterStrip from "@/components/dashboard-filter-strip";
import DashboardMetricCard from "@/components/dashboard-metric-card";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { useInspectionBrowser } from "@/hooks/use-inspection-browser";
import { useInspectionLookups } from "@/hooks/use-inspection-lookups";
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

function createMapLink(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function renderMapPoint(
  point: InspectionMapPoint,
  points: InspectionMapPoint[],
) {
  const longitudes = points.map((item) => item.location.longitude);
  const latitudes = points.map((item) => item.location.latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const left =
    minLongitude === maxLongitude
      ? 50
      : ((point.location.longitude - minLongitude) /
          (maxLongitude - minLongitude)) *
        100;
  const top =
    minLatitude === maxLatitude
      ? 50
      : 100 -
        ((point.location.latitude - minLatitude) /
          (maxLatitude - minLatitude)) *
          100;

  return {
    left: `${Math.min(94, Math.max(6, left))}%`,
    top: `${Math.min(94, Math.max(6, top))}%`,
  };
}

export default function OperationsReport() {
  const [lguLookupSearch, setLguLookupSearch] = useState("");
  const [selectedLguLabel, setSelectedLguLabel] = useState("");
  const [officeLookupSearch, setOfficeLookupSearch] = useState("");
  const [selectedOfficeLabel, setSelectedOfficeLabel] = useState("");
  const { activeCount, clearValues, page, setPage, setValue, values } =
    useBrowserQueryParams({
      defaults: { status: "all" },
      keys: ["from", "lguId", "officeId", "status", "to"] as const,
    });
  const { accessToken, session } = useAuthSession();
  const isAdmin = session?.user.role === "admin";
  const status = values.status as InspectionRecord["status"] | "all";
  const from = values.from;
  const lguId = values.lguId;
  const officeId = values.officeId;
  const to = values.to;
  const { byOfficeQuery, inspectionsQuery, mapPointsQuery, summaryQuery } =
    useInspectionBrowser({
      accessToken,
      from: from ? new Date(`${from}T00:00:00.000Z`).toISOString() : undefined,
      lguId: lguId || undefined,
      officeId: officeId || undefined,
      page,
      status: status === "all" ? undefined : status,
      to: to ? new Date(`${to}T23:59:59.999Z`).toISOString() : undefined,
    });
  const { lgusQuery, officesQuery } = useInspectionLookups({
    accessToken: accessToken ?? "",
    lguSearch: lguLookupSearch,
    officeSearch: officeLookupSearch,
    selectedLguId: lguId || undefined,
    selectedOfficeId: officeId || undefined,
  });

  const inspections = inspectionsQuery.data?.data ?? [];
  const inspectionsMeta = inspectionsQuery.data?.meta;
  const summary = summaryQuery.data;
  const lguOptions = (lgusQuery.data?.data ?? []).map((lgu) => ({
    label: `${lgu.name} · ${lgu.code}`,
    value: lgu.id,
  }));
  const officeOptions = (officesQuery.data?.data ?? []).map((office) => ({
    label: `${office.name} · ${office.code}`,
    value: office.id,
  }));
  const activeLguLabel =
    lguOptions.find((option) => option.value === lguId)?.label ||
    inspections.find((inspection) => inspection.office.lguId === lguId)?.office
      .lguId ||
    selectedLguLabel ||
    lguId;
  const activeOfficeLabel =
    officeOptions.find((option) => option.value === officeId)?.label ||
    inspections.find((inspection) => inspection.office.id === officeId)?.office
      .name ||
    selectedOfficeLabel ||
    officeId;
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
      title: "Office",
      key: "office",
      render: (_value, record) =>
        `${record.office.name} · ${record.office.code}`,
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
              {lguId ? <Tag color="purple">LGU: {activeLguLabel}</Tag> : null}
              {officeId ? (
                <Tag color="cyan">Office: {activeOfficeLabel}</Tag>
              ) : null}
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
                    showSearch
                    filterOption={false}
                    aria-label="LGU scope filter"
                    options={lguOptions}
                    loading={lgusQuery.isLoading}
                    style={{ width: 240 }}
                    placeholder="Filter LGU"
                    value={lguId || undefined}
                    onChange={(value) => {
                      const nextLabel =
                        lguOptions.find((option) => option.value === value)
                          ?.label || "";

                      setSelectedLguLabel(nextLabel);
                      setValue("lguId", value ?? "");
                    }}
                    onSearch={setLguLookupSearch}
                  />
                  <Select
                    allowClear
                    showSearch
                    filterOption={false}
                    aria-label="Office scope filter"
                    options={officeOptions}
                    loading={officesQuery.isLoading}
                    style={{ width: 220 }}
                    placeholder="Filter office"
                    value={officeId || undefined}
                    onChange={(value) => {
                      const nextLabel =
                        officeOptions.find((option) => option.value === value)
                          ?.label || "";

                      setSelectedOfficeLabel(nextLabel);
                      setValue("officeId", value ?? "");
                    }}
                    onSearch={setOfficeLookupSearch}
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

            <Card
              title="Breakdown by office"
              className="glass-card dashboard-data-card"
            >
              {byOfficeQuery.isLoading ? null : byOfficeQuery.data?.length ? (
                <Table
                  className="dashboard-table"
                  dataSource={byOfficeQuery.data}
                  pagination={false}
                  rowKey="officeId"
                  scroll={{ x: true }}
                  columns={[
                    {
                      title: "Office",
                      dataIndex: "officeName",
                      key: "officeName",
                    },
                    {
                      title: "Scheduled",
                      dataIndex: "scheduled",
                      key: "scheduled",
                    },
                    {
                      title: "In progress",
                      dataIndex: "inProgress",
                      key: "inProgress",
                    },
                    {
                      title: "Completed",
                      dataIndex: "completed",
                      key: "completed",
                    },
                    {
                      title: "Overdue",
                      dataIndex: "overdue",
                      key: "overdue",
                    },
                    {
                      title: "Total",
                      dataIndex: "total",
                      key: "total",
                    },
                  ]}
                />
              ) : (
                <Empty description="No office breakdown data for the selected filters" />
              )}
            </Card>

            <Card
              title="Inspection coverage map"
              className="glass-card dashboard-data-card"
            >
              {mapPointsQuery.isLoading ? null : mapPointsQuery.data?.length ? (
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <div
                    style={{
                      background:
                        "radial-gradient(circle at top, rgba(255,255,255,0.22), rgba(255,255,255,0.06)), linear-gradient(135deg, #f6ead5, #d9efe8)",
                      border: "1px solid rgba(15, 23, 42, 0.08)",
                      borderRadius: 20,
                      height: 280,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {mapPointsQuery.data.map((point) => {
                      const position = renderMapPoint(
                        point,
                        mapPointsQuery.data ?? [],
                      );

                      return (
                        <div
                          key={point.id}
                          style={{
                            left: position.left,
                            position: "absolute",
                            top: position.top,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <div
                            style={{
                              background: "#155eef",
                              border: "2px solid white",
                              borderRadius: 999,
                              boxShadow: "0 10px 24px rgba(21, 94, 239, 0.28)",
                              height: 16,
                              width: 16,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <Space
                    direction="vertical"
                    size={8}
                    style={{ width: "100%" }}
                  >
                    {mapPointsQuery.data.map((point) => (
                      <Space
                        key={point.id}
                        align="start"
                        style={{
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                        wrap
                      >
                        <Space direction="vertical" size={0}>
                          <Typography.Text strong>
                            {point.business.businessName}
                          </Typography.Text>
                          <Typography.Text type="secondary">
                            {point.office.name} ·{" "}
                            {point.location.latitude.toFixed(5)},{" "}
                            {point.location.longitude.toFixed(5)}
                          </Typography.Text>
                        </Space>
                        <Typography.Link
                          href={createMapLink(
                            point.location.latitude,
                            point.location.longitude,
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open pin
                        </Typography.Link>
                      </Space>
                    ))}
                  </Space>
                </Space>
              ) : (
                <Empty description="No scoped inspection coordinates available for the selected filters" />
              )}
            </Card>

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
