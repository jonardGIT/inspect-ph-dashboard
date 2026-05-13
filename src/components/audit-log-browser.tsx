"use client";

import Link from "next/link";
import {
  Alert,
  Card,
  Empty,
  Input,
  Pagination,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableProps } from "antd";
import type { AuditLogRecord } from "@shared/types/api";

import DashboardFilterStrip from "@/components/dashboard-filter-strip";
import DashboardMetricCard from "@/components/dashboard-metric-card";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useAuditLogBrowser } from "@/hooks/use-audit-log-browser";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { getApiErrorMessage } from "@/lib/api/http";

const actionOptions: { label: string; value: AuditLogRecord["action"] | "all" }[] = [
  { label: "All actions", value: "all" },
  { label: "Inspection created", value: "inspection.created" },
  { label: "Inspection assigned", value: "inspection.assigned" },
  { label: "Inspection status updated", value: "inspection.status_updated" },
  {
    label: "Checklist result recorded",
    value: "inspection.checklist_result_recorded",
  },
  { label: "Finding created", value: "finding.created" },
  { label: "Finding resolved", value: "finding.resolved" },
  { label: "Attachment uploaded", value: "attachment.uploaded" },
  { label: "Admin bootstrap", value: "auth.bootstrap_admin" },
  { label: "User login", value: "auth.login" },
];

const entityTypeOptions: {
  label: string;
  value: AuditLogRecord["entityType"] | "all";
}[] = [
  { label: "All entity types", value: "all" },
  { label: "Inspection", value: "inspection" },
  { label: "Checklist result", value: "checklist_result" },
  { label: "Finding", value: "finding" },
  { label: "Attachment", value: "attachment" },
  { label: "User", value: "user" },
];

const entityTypeColors: Record<AuditLogRecord["entityType"], string> = {
  attachment: "default",
  checklist_result: "blue",
  finding: "red",
  inspection: "gold",
  user: "green",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatActionLabel(value: AuditLogRecord["action"] | "all") {
  const match = actionOptions.find((option) => option.value === value);

  return match?.label ?? value;
}

function formatEntityTypeLabel(value: AuditLogRecord["entityType"] | "all") {
  const match = entityTypeOptions.find((option) => option.value === value);

  return match?.label ?? value;
}

function getInspectionEntityHref(record: AuditLogRecord) {
  if (record.entityType !== "inspection" || !record.entityId) {
    return null;
  }

  return `/inspections/${record.entityId}`;
}

export default function AuditLogBrowser() {
  const { activeCount, clearValues, page, setPage, setValue, setValues, values } =
    useBrowserQueryParams({
      defaults: { action: "all", entityType: "all" },
      keys: ["action", "entityType", "search"] as const,
    });
  const { accessToken, session } = useAuthSession();
  const isAdmin = session?.user.role === "admin";
  const action = values.action as AuditLogRecord["action"] | "all";
  const entityType = values.entityType as AuditLogRecord["entityType"] | "all";
  const search = values.search;
  const { auditLogsQuery } = useAuditLogBrowser({
    accessToken,
    action: action === "all" ? undefined : action,
    enabled: Boolean(accessToken) && isAdmin,
    entityType: entityType === "all" ? undefined : entityType,
    page,
    search: search || undefined,
  });

  const auditLogs = auditLogsQuery.data?.data ?? [];
  const meta = auditLogsQuery.data?.meta;
  const columns: TableProps<AuditLogRecord>["columns"] = [
    {
      title: "When",
      key: "createdAt",
      render: (_value, record) => formatDate(record.createdAt),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      filteredValue: action === "all" ? null : [action],
      filters: actionOptions
        .filter((option) => option.value !== "all")
        .map((option) => ({ text: option.label, value: option.value })),
      render: (value: AuditLogRecord["action"]) => (
        <Tag color="gold">{formatActionLabel(value)}</Tag>
      ),
    },
    {
      title: "Summary",
      key: "summary",
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.summary}</Typography.Text>
          {record.detail ? (
            <Typography.Text type="secondary">{record.detail}</Typography.Text>
          ) : null}
        </Space>
      ),
    },
    {
      title: "Actor",
      key: "actor",
      render: (_value, record) =>
        record.actor ? (
          <Space direction="vertical" size={0}>
            <Typography.Text>{record.actor.name}</Typography.Text>
            <Typography.Text type="secondary">{record.actor.email}</Typography.Text>
          </Space>
        ) : (
          <Typography.Text type="secondary">System</Typography.Text>
        ),
    },
    {
      title: "Entity",
      dataIndex: "entityType",
      key: "entityType",
      filteredValue: entityType === "all" ? null : [entityType],
      filters: entityTypeOptions
        .filter((option) => option.value !== "all")
        .map((option) => ({ text: option.label, value: option.value })),
      render: (_value, record) => {
        const inspectionHref = getInspectionEntityHref(record);

        return (
          <Space direction="vertical" size={4}>
            <Tag color={entityTypeColors[record.entityType]}>
              {formatEntityTypeLabel(record.entityType)}
            </Tag>
            {record.entityId ? (
              inspectionHref ? (
                <Link href={inspectionHref}>{record.entityId}</Link>
              ) : (
                <Typography.Text type="secondary">{record.entityId}</Typography.Text>
              )
            ) : null}
          </Space>
        );
      },
    },
  ];

  return (
    <InspectionRouteShell
      eyebrow="BPLO accountability"
      title="Audit log"
      description="Review operational activity across authentication and inspection workflows with actor, entity, and event context."
    >
      {!accessToken ? null : !isAdmin ? (
        <Alert
          type="warning"
          showIcon
          message="Audit log access is limited to admins."
        />
      ) : (
        <>
          {activeCount ? (
            <DashboardFilterStrip onClear={clearValues}>
              {action !== "all" ? (
                <Tag color="gold">Action: {formatActionLabel(action)}</Tag>
              ) : null}
              {entityType !== "all" ? (
                <Tag color="blue">Entity: {formatEntityTypeLabel(entityType)}</Tag>
              ) : null}
              {search ? <Tag color="cyan">Search: {search}</Tag> : null}
            </DashboardFilterStrip>
          ) : null}

          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <Space size={16} style={{ width: "100%" }} wrap>
              <DashboardMetricCard
                label="Visible events"
                value={auditLogs.length}
                description="Current result window"
              />
              <DashboardMetricCard
                accent
                label="Action focus"
                value={formatActionLabel(action)}
                description="Active event filter"
              />
              <DashboardMetricCard
                label="Entity focus"
                value={formatEntityTypeLabel(entityType)}
                description="Current entity filter"
              />
            </Space>

            {auditLogsQuery.error ? (
              <Alert
                type="error"
                showIcon
                message={getApiErrorMessage(auditLogsQuery.error)}
              />
            ) : null}

            <Card title="Activity stream" className="glass-card dashboard-data-card">
              <Space
                align="start"
                size={12}
                style={{ justifyContent: "space-between", marginBottom: 20, width: "100%" }}
                wrap
              >
                <Space direction="vertical" size={4}>
                  <Typography.Text strong>Table search</Typography.Text>
                  <Typography.Text type="secondary">
                    Search summary, detail, actor, or entity ID.
                  </Typography.Text>
                </Space>
                <Input.Search
                  allowClear
                  aria-label="Audit log search"
                  placeholder="Search summary, detail, actor, or entity ID"
                  style={{ maxWidth: 360 }}
                  value={search}
                  onChange={(event) => setValue("search", event.target.value)}
                />
              </Space>
              {auditLogsQuery.isLoading ? null : auditLogs.length ? (
                <>
                  <Table
                    className="dashboard-table"
                    columns={columns}
                    dataSource={auditLogs}
                    pagination={false}
                    rowKey="id"
                    scroll={{ x: true }}
                    onChange={(_pagination, filters) => {
                      const nextAction =
                        Array.isArray(filters.action) &&
                        typeof filters.action[0] === "string"
                          ? filters.action[0]
                          : "all";
                      const nextEntityType =
                        Array.isArray(filters.entityType) &&
                        typeof filters.entityType[0] === "string"
                          ? filters.entityType[0]
                          : "all";

                      setValues({
                        action: nextAction,
                        entityType: nextEntityType,
                      });
                    }}
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
                <Empty description="No audit events found for the current filters" />
              )}
            </Card>
          </Space>
        </>
      )}
    </InspectionRouteShell>
  );
}