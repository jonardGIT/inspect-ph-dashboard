"use client";

import Link from "next/link";
import {
  Alert,
  Button,
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
import type { NotificationOutboxRecord } from "@shared/types/api";

import DashboardFilterStrip from "@/components/dashboard-filter-strip";
import DashboardMetricCard from "@/components/dashboard-metric-card";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { useNotificationOutboxBrowser } from "@/hooks/use-notification-outbox-browser";
import { getApiErrorMessage } from "@/lib/api/http";

const eventTypeOptions: {
  label: string;
  value: NotificationOutboxRecord["eventType"] | "all";
}[] = [
  { label: "All events", value: "all" },
  { label: "Inspection assigned", value: "inspection.assigned" },
  {
    label: "Inspection status updated",
    value: "inspection.status_updated",
  },
];

const statusOptions: {
  label: string;
  value: NotificationOutboxRecord["status"] | "all";
}[] = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processed", value: "processed" },
  { label: "Failed", value: "failed" },
];

const statusColors: Record<NotificationOutboxRecord["status"], string> = {
  failed: "red",
  pending: "gold",
  processed: "green",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatEventTypeLabel(
  value: NotificationOutboxRecord["eventType"] | "all",
) {
  const match = eventTypeOptions.find((option) => option.value === value);

  return match?.label ?? value;
}

function formatStatusLabel(value: NotificationOutboxRecord["status"] | "all") {
  const match = statusOptions.find((option) => option.value === value);

  return match?.label ?? value;
}

function getInspectionHref(record: NotificationOutboxRecord) {
  if (record.entityType !== "inspection" || !record.entityId) {
    return null;
  }

  return `/inspections/${record.entityId}`;
}

export default function NotificationOutboxBrowser() {
  const {
    activeCount,
    clearValues,
    page,
    setPage,
    setValue,
    setValues,
    values,
  } = useBrowserQueryParams({
    defaults: { eventType: "all", status: "all" },
    keys: ["eventType", "status", "search"] as const,
  });
  const { accessToken, session } = useAuthSession();
  const isAdmin = session?.user.role === "admin";
  const eventType = values.eventType as
    | NotificationOutboxRecord["eventType"]
    | "all";
  const status = values.status as NotificationOutboxRecord["status"] | "all";
  const search = values.search;
  const { notificationOutboxQuery, updateNotificationStatusMutation } =
    useNotificationOutboxBrowser({
      accessToken,
      enabled: Boolean(accessToken) && isAdmin,
      eventType: eventType === "all" ? undefined : eventType,
      page,
      search: search || undefined,
      status: status === "all" ? undefined : status,
    });

  const notifications = notificationOutboxQuery.data?.data ?? [];
  const meta = notificationOutboxQuery.data?.meta;
  const columns: TableProps<NotificationOutboxRecord>["columns"] = [
    {
      title: "Queued",
      key: "createdAt",
      render: (_value, record) => formatDate(record.createdAt),
    },
    {
      title: "Event",
      dataIndex: "eventType",
      key: "eventType",
      filteredValue: eventType === "all" ? null : [eventType],
      filters: eventTypeOptions
        .filter((option) => option.value !== "all")
        .map((option) => ({ text: option.label, value: option.value })),
      render: (value: NotificationOutboxRecord["eventType"]) => (
        <Tag color="blue">{formatEventTypeLabel(value)}</Tag>
      ),
    },
    {
      title: "Message",
      key: "message",
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.title}</Typography.Text>
          <Typography.Text type="secondary">{record.body}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Recipient",
      key: "recipient",
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{record.recipient.name}</Typography.Text>
          <Typography.Text type="secondary">
            {record.recipient.email}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filteredValue: status === "all" ? null : [status],
      filters: statusOptions
        .filter((option) => option.value !== "all")
        .map((option) => ({ text: option.label, value: option.value })),
      render: (value: NotificationOutboxRecord["status"]) => (
        <Tag color={statusColors[value]}>{formatStatusLabel(value)}</Tag>
      ),
    },
    {
      title: "Entity",
      key: "entity",
      render: (_value, record) => {
        const inspectionHref = getInspectionHref(record);

        return record.entityId ? (
          inspectionHref ? (
            <Link href={inspectionHref}>{record.entityId}</Link>
          ) : (
            <Typography.Text type="secondary">
              {record.entityId}
            </Typography.Text>
          )
        ) : (
          <Typography.Text type="secondary">No linked entity</Typography.Text>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_value, record) => (
        <Space wrap>
          <Button
            size="small"
            disabled={
              record.status === "processed" ||
              updateNotificationStatusMutation.isPending
            }
            onClick={() =>
              updateNotificationStatusMutation.mutate({
                id: record.id,
                status: "processed",
              })
            }
          >
            Mark processed
          </Button>
          <Button
            danger
            size="small"
            disabled={
              record.status === "failed" ||
              updateNotificationStatusMutation.isPending
            }
            onClick={() =>
              updateNotificationStatusMutation.mutate({
                id: record.id,
                status: "failed",
              })
            }
          >
            Mark failed
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <InspectionRouteShell
      eyebrow="BPLO delivery queue"
      title="Notifications outbox"
      description="Review queued in-app notification deliveries, recipient targeting, and processing status for operational events."
    >
      {!accessToken ? null : !isAdmin ? (
        <Alert
          type="warning"
          showIcon
          message="Notifications outbox access is limited to admins."
        />
      ) : (
        <>
          {activeCount ? (
            <DashboardFilterStrip onClear={clearValues}>
              {eventType !== "all" ? (
                <Tag color="blue">Event: {formatEventTypeLabel(eventType)}</Tag>
              ) : null}
              {status !== "all" ? (
                <Tag color="gold">Status: {formatStatusLabel(status)}</Tag>
              ) : null}
              {search ? <Tag color="cyan">Search: {search}</Tag> : null}
            </DashboardFilterStrip>
          ) : null}

          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <Space size={16} style={{ width: "100%" }} wrap>
              <DashboardMetricCard
                label="Visible notifications"
                value={notifications.length}
                description="Current result window"
              />
              <DashboardMetricCard
                accent
                label="Event focus"
                value={formatEventTypeLabel(eventType)}
                description="Active event filter"
              />
              <DashboardMetricCard
                label="Status focus"
                value={formatStatusLabel(status)}
                description="Current delivery status filter"
              />
            </Space>

            {notificationOutboxQuery.error ? (
              <Alert
                type="error"
                showIcon
                message={getApiErrorMessage(notificationOutboxQuery.error)}
              />
            ) : null}

            {updateNotificationStatusMutation.error ? (
              <Alert
                type="error"
                showIcon
                message={getApiErrorMessage(
                  updateNotificationStatusMutation.error,
                )}
              />
            ) : null}

            <Card
              title="Queued deliveries"
              className="glass-card dashboard-data-card"
            >
              <Space
                align="start"
                size={12}
                style={{
                  justifyContent: "space-between",
                  marginBottom: 20,
                  width: "100%",
                }}
                wrap
              >
                <Space direction="vertical" size={4}>
                  <Typography.Text strong>Table search</Typography.Text>
                  <Typography.Text type="secondary">
                    Search title, body, recipient, or entity ID.
                  </Typography.Text>
                </Space>
                <Input.Search
                  allowClear
                  aria-label="Notification outbox search"
                  placeholder="Search title, body, recipient, or entity ID"
                  style={{ maxWidth: 360 }}
                  value={search}
                  onChange={(event) => setValue("search", event.target.value)}
                />
              </Space>
              {notificationOutboxQuery.isLoading ? null : notifications.length ? (
                <>
                  <Table
                    className="dashboard-table"
                    columns={columns}
                    dataSource={notifications}
                    pagination={false}
                    rowKey="id"
                    scroll={{ x: true }}
                    onChange={(_pagination, filters) => {
                      const nextEventType =
                        Array.isArray(filters.eventType) &&
                        typeof filters.eventType[0] === "string"
                          ? filters.eventType[0]
                          : "all";
                      const nextStatus =
                        Array.isArray(filters.status) &&
                        typeof filters.status[0] === "string"
                          ? filters.status[0]
                          : "all";

                      setValues({
                        eventType: nextEventType,
                        status: nextStatus,
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
                <Empty description="No queued notifications found for the current filters" />
              )}
            </Card>
          </Space>
        </>
      )}
    </InspectionRouteShell>
  );
}
