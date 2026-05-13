"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";

import DashboardFilterStrip from "@/components/dashboard-filter-strip";
import DashboardMetricCard from "./dashboard-metric-card";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { useInspectionBrowser } from "@/hooks/use-inspection-browser";
import { useInspectionLookups } from "@/hooks/use-inspection-lookups";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { getApiErrorMessage } from "@/lib/api/http";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Scheduled", value: "scheduled" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Overdue", value: "overdue" },
  { label: "Canceled", value: "canceled" },
] as const;

const statusColors: Record<string, string> = {
  canceled: "default",
  completed: "green",
  in_progress: "gold",
  overdue: "red",
  scheduled: "blue",
};

function formatDate(value?: string) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function createMapLink(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export default function InspectionBrowser() {
  const [form] = Form.useForm();
  const [businessLookupSearch, setBusinessLookupSearch] = useState("");
  const [inspectionIdInput, setInspectionIdInput] = useState("");
  const [inspectorLookupSearch, setInspectorLookupSearch] = useState("");
  const [selectedBusinessLabel, setSelectedBusinessLabel] = useState("");
  const [selectedInspectorLabel, setSelectedInspectorLabel] = useState("");
  const { activeCount, clearValues, page, setPage, setValue, values } =
    useBrowserQueryParams({
      defaults: { status: "all" },
      keys: ["status", "businessId", "inspectorId", "from", "to"] as const,
    });
  const { accessToken, session } = useAuthSession();
  const isAdmin = session?.user.role === "admin";
  const businessId = values.businessId;
  const from = values.from;
  const inspectorId = values.inspectorId;
  const status = values.status as (typeof statusOptions)[number]["value"];
  const to = values.to;
  const scheduleBusinessId = Form.useWatch("businessId", form) as
    | string
    | undefined;

  const { createInspectionMutation, inspectionsQuery, summaryQuery } =
    useInspectionBrowser({
      accessToken: accessToken ?? "",
      businessId: businessId || undefined,
      from: from || undefined,
      inspectorId: inspectorId || undefined,
      page,
      status: status === "all" ? undefined : status,
      to: to || undefined,
    });
  const { businessesQuery, inspectorsQuery, permitsQuery } =
    useInspectionLookups({
      accessToken: accessToken ?? "",
      businessSearch: businessLookupSearch,
      canListInspectors: isAdmin,
      inspectorSearch: inspectorLookupSearch,
      permitBusinessId: scheduleBusinessId,
      selectedBusinessId: businessId || undefined,
      selectedInspectorId: inspectorId || undefined,
    });

  const inspections = inspectionsQuery.data?.data ?? [];
  const businessOptions = (businessesQuery.data?.data ?? []).map(
    (business) => ({
      label: `${business.businessName} · ${business.ownerName}`,
      value: business.id,
    }),
  );
  const inspectorOptions = (inspectorsQuery.data?.data ?? []).map((user) => ({
    label: `${user.name} · ${user.email}`,
    value: user.id,
  }));
  const meta = inspectionsQuery.data?.meta;
  const permitOptions = (permitsQuery.data?.data ?? []).map((permit) => ({
    label: `${permit.permitNumber} · ${permit.lineOfBusiness}`,
    value: permit.id,
  }));
  const summary = summaryQuery.data;
  const activeBusinessLabel =
    businessOptions.find((option) => option.value === businessId)?.label ||
    inspections.find((item) => item.business.id === businessId)?.business
      .businessName ||
    selectedBusinessLabel ||
    businessId;
  const activeInspectorLabel =
    inspectorOptions.find((option) => option.value === inspectorId)?.label ||
    selectedInspectorLabel ||
    inspectorId;

  return (
    <InspectionRouteShell
      eyebrow="BPLO inspection operations"
      title="Inspections"
      description="Browse assigned or scoped inspections, review KPI counts, and jump directly into the inspection workspace when you already know the ID."
      secondarySidebar={
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Card title="Open by ID" className="glass-card dashboard-side-card">
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Typography.Paragraph style={{ margin: 0 }}>
                Use this when an office already provided a concrete inspection
                ID.
              </Typography.Paragraph>
              <Input
                placeholder="Inspection UUID"
                value={inspectionIdInput}
                onChange={(event) => setInspectionIdInput(event.target.value)}
              />
              <Button
                type="primary"
                disabled={!inspectionIdInput.trim()}
                href={`/inspections/${inspectionIdInput.trim()}`}
              >
                Open inspection workspace
              </Button>
            </Space>
          </Card>

          <Card
            title="Overview filters"
            className="glass-card dashboard-side-card"
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Select
                allowClear
                showSearch
                filterOption={false}
                placeholder="Business"
                value={businessId || undefined}
                options={businessOptions}
                loading={businessesQuery.isLoading}
                onChange={(value) => {
                  const nextLabel =
                    businessOptions.find((option) => option.value === value)
                      ?.label || "";

                  setSelectedBusinessLabel(nextLabel);
                  setValue("businessId", value || "");
                }}
                onSearch={setBusinessLookupSearch}
              />
              {isAdmin ? (
                <Select
                  allowClear
                  showSearch
                  filterOption={false}
                  placeholder="Inspector"
                  value={inspectorId || undefined}
                  options={inspectorOptions}
                  loading={inspectorsQuery.isLoading}
                  onChange={(value) => {
                    const nextLabel =
                      inspectorOptions.find((option) => option.value === value)
                        ?.label || "";

                    setSelectedInspectorLabel(nextLabel);
                    setValue("inspectorId", value || "");
                  }}
                  onSearch={setInspectorLookupSearch}
                />
              ) : null}
              <Input
                placeholder="Summary from (ISO)"
                value={from}
                onChange={(event) => setValue("from", event.target.value)}
              />
              <Input
                placeholder="Summary to (ISO)"
                value={to}
                onChange={(event) => setValue("to", event.target.value)}
              />
              {activeCount ? (
                <Button onClick={clearValues}>Clear filters</Button>
              ) : null}
            </Space>
          </Card>
        </Space>
      }
    >
      {summaryQuery.error || inspectionsQuery.error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          message={getApiErrorMessage(
            summaryQuery.error || inspectionsQuery.error,
          )}
        />
      ) : null}

      {activeCount ? (
        <DashboardFilterStrip onClear={clearValues}>
          {businessId ? (
            <Tag color="blue">Business: {activeBusinessLabel}</Tag>
          ) : null}
          {inspectorId ? (
            <Tag color="green">Inspector: {activeInspectorLabel}</Tag>
          ) : null}
          {from ? <Tag color="purple">From: {from}</Tag> : null}
          {status !== "all" ? (
            <Tag color="gold">Status: {status.replace("_", " ")}</Tag>
          ) : null}
          {to ? <Tag color="cyan">To: {to}</Tag> : null}
        </DashboardFilterStrip>
      ) : null}

      <Row gutter={[16, 16]} className="dashboard-summary-row">
        <Col xs={12} md={8} lg={4}>
          <DashboardMetricCard
            label="Total"
            value={summary?.total ?? 0}
            description="All inspections in scope"
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <DashboardMetricCard
            label="Scheduled"
            value={summary?.scheduled ?? 0}
            description="Ready for field work"
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <DashboardMetricCard
            accent
            label="In progress"
            value={summary?.inProgress ?? 0}
            description="Currently being worked"
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <DashboardMetricCard
            label="Completed"
            value={summary?.completed ?? 0}
            description="Finished inspections"
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <DashboardMetricCard
            label="Overdue"
            value={summary?.overdue ?? 0}
            description="Needs immediate follow-up"
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <DashboardMetricCard
            label="Canceled"
            value={summary?.canceled ?? 0}
            description="Closed without execution"
          />
        </Col>
      </Row>

      <Card
        title="Inspection queue"
        className="glass-card dashboard-data-card"
        style={{ marginBottom: 20 }}
        extra={
          <Select
            style={{ minWidth: 180 }}
            value={status}
            options={
              statusOptions as unknown as { label: string; value: string }[]
            }
            onChange={(value) => setValue("status", value)}
          />
        }
      >
        {inspectionsQuery.isLoading ? (
          <Spin size="large" />
        ) : inspections.length ? (
          <>
            <Table
              className="dashboard-table"
              dataSource={inspections}
              pagination={false}
              rowKey="id"
              scroll={{ x: true }}
              columns={[
                {
                  title: "Business",
                  dataIndex: ["business", "businessName"],
                  key: "business",
                },
                {
                  title: "Permit",
                  dataIndex: ["permit", "permitNumber"],
                  key: "permit",
                },
                {
                  title: "Scheduled",
                  key: "scheduledAt",
                  render: (_value, record) => formatDate(record.scheduledAt),
                },
                {
                  title: "Location",
                  key: "location",
                  render: (_value, record) =>
                    record.location ? (
                      <Space direction="vertical" size={0}>
                        <Typography.Text>
                          {record.location.latitude.toFixed(5)},{" "}
                          {record.location.longitude.toFixed(5)}
                        </Typography.Text>
                        <Typography.Link
                          href={createMapLink(
                            record.location.latitude,
                            record.location.longitude,
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open map
                        </Typography.Link>
                      </Space>
                    ) : (
                      <Typography.Text type="secondary">
                        No location
                      </Typography.Text>
                    ),
                },
                {
                  title: "Status",
                  key: "status",
                  render: (_value, record) => (
                    <Tag color={statusColors[record.status] || "default"}>
                      {record.status.replace("_", " ")}
                    </Tag>
                  ),
                },
                {
                  title: "Action",
                  key: "action",
                  render: (_value, record) => (
                    <Button type="link" style={{ padding: 0 }}>
                      <Link href={`/inspections/${record.id}`}>
                        Open workspace
                      </Link>
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
          <Empty description="No inspections found for the selected filters" />
        )}
      </Card>

      {session?.user.role === "admin" ? (
        <Card
          title="Schedule inspection"
          className="glass-card dashboard-form-card"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              await createInspectionMutation.mutateAsync({
                businessId: values.businessId,
                ...(values.inspectorId
                  ? { inspectorId: values.inspectorId }
                  : {}),
                ...(values.notes ? { notes: values.notes } : {}),
                permitRecordId: values.permitRecordId,
                scheduledAt: values.scheduledAt,
              });
              form.resetFields();
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Business"
                  name="businessId"
                  rules={[{ required: true }]}
                >
                  <Select
                    showSearch
                    filterOption={false}
                    placeholder="Select business establishment"
                    options={businessOptions}
                    loading={businessesQuery.isLoading}
                    onChange={() =>
                      form.setFieldValue("permitRecordId", undefined)
                    }
                    onSearch={setBusinessLookupSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Permit"
                  name="permitRecordId"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder={
                      scheduleBusinessId
                        ? "Select permit record"
                        : "Choose a business first"
                    }
                    disabled={!scheduleBusinessId}
                    options={permitOptions}
                    loading={permitsQuery.isLoading}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Scheduled at"
                  name="scheduledAt"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="2026-05-14T08:00:00.000Z" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Inspector" name="inspectorId">
                  <Select
                    allowClear
                    showSearch
                    filterOption={false}
                    placeholder="Optional inspector assignment"
                    options={inspectorOptions}
                    loading={inspectorsQuery.isLoading}
                    onSearch={setInspectorLookupSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="Notes" name="notes">
                  <Input.TextArea
                    rows={3}
                    placeholder="Assignment context or site notes"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={createInspectionMutation.isPending}
              >
                Schedule inspection
              </Button>
              {createInspectionMutation.error ? (
                <Alert
                  type="error"
                  showIcon
                  message={getApiErrorMessage(createInspectionMutation.error)}
                />
              ) : null}
            </Space>
          </Form>
        </Card>
      ) : null}
    </InspectionRouteShell>
  );
}
