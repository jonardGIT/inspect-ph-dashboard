"use client";

import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";

import DashboardFilterStrip from "@/components/dashboard-filter-strip";
import DashboardMetricCard from "@/components/dashboard-metric-card";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { useSessionBrowser } from "@/hooks/use-session-browser";
import { getApiErrorMessage } from "@/lib/api/http";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function SessionBrowser() {
  const { activeCount, clearValues, setValue, values } = useBrowserQueryParams({
    keys: ["userId"] as const,
  });
  const { accessToken, logout, session } = useAuthSession();
  const isAdmin = session?.user.role === "admin";
  const selectedUserId = values.userId;
  const { revokeSessionMutation, sessionsQuery, usersQuery } =
    useSessionBrowser({
      accessToken,
      isAdmin,
      selectedUserId: selectedUserId || undefined,
    });

  const users = usersQuery.data?.data ?? [];
  const sessions = sessionsQuery.data ?? [];
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;

  return (
    <InspectionRouteShell
      eyebrow="Security operations"
      title="Sessions"
      description="Review active authenticated sessions and revoke access when a device should no longer keep a valid session."
      secondarySidebar={
        <Card title="Filters" className="glass-card dashboard-side-card">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {isAdmin ? (
              <Select
                allowClear
                showSearch
                placeholder="View sessions for a specific user"
                options={users.map((user) => ({
                  label: `${user.name} · ${user.email}`,
                  value: user.id,
                }))}
                value={selectedUserId || undefined}
                onChange={(value) => setValue("userId", value ?? "")}
              />
            ) : null}
            {activeCount ? (
              <Button onClick={clearValues}>Clear filters</Button>
            ) : null}
          </Space>
        </Card>
      }
    >
      {activeCount ? (
        <DashboardFilterStrip onClear={clearValues}>
          {selectedUser ? (
            <Tag color="blue">User: {selectedUser.name}</Tag>
          ) : null}
        </DashboardFilterStrip>
      ) : null}

      <Row gutter={[16, 16]} className="dashboard-summary-row">
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Visible sessions"
            value={sessions.length}
            description="Active session inventory"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            accent
            label="Current device"
            value={
              sessions.some((item) => item.isCurrent) ? "Tracked" : "Unknown"
            }
            description="Current session marker"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Viewing scope"
            value={
              selectedUser?.name ?? (isAdmin ? "My sessions" : "Own sessions")
            }
            description="Session inventory filter"
          />
        </Col>
      </Row>

      {sessionsQuery.error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          message={getApiErrorMessage(sessionsQuery.error)}
        />
      ) : null}
      {revokeSessionMutation.error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          message={getApiErrorMessage(revokeSessionMutation.error)}
        />
      ) : null}

      <Card title="Active sessions" className="glass-card dashboard-data-card">
        {sessionsQuery.isLoading ? null : sessions.length ? (
          <Table
            className="dashboard-table"
            dataSource={sessions}
            pagination={false}
            rowKey="id"
            scroll={{ x: true }}
            columns={[
              ...(isAdmin
                ? [
                    {
                      title: "User",
                      key: "user",
                      render: (
                        _value: unknown,
                        record: (typeof sessions)[number],
                      ) =>
                        record.user
                          ? `${record.user.name} · ${record.user.email}`
                          : "Current user",
                    },
                  ]
                : []),
              {
                title: "Session",
                key: "session",
                render: (
                  _value: unknown,
                  record: (typeof sessions)[number],
                ) => (
                  <Space direction="vertical" size={0}>
                    <Typography.Text strong>{record.id}</Typography.Text>
                    <Typography.Text type="secondary">
                      {record.userAgent || "Unknown device"}
                    </Typography.Text>
                  </Space>
                ),
              },
              {
                title: "Network",
                key: "network",
                render: (_value: unknown, record: (typeof sessions)[number]) =>
                  record.ipAddress || "Unknown IP",
              },
              {
                title: "Status",
                key: "status",
                render: (
                  _value: unknown,
                  record: (typeof sessions)[number],
                ) => (
                  <Space>
                    {record.isCurrent ? <Tag color="green">current</Tag> : null}
                    <Tag color="blue">active</Tag>
                  </Space>
                ),
              },
              {
                title: "Last active",
                key: "lastUsedAt",
                render: (_value: unknown, record: (typeof sessions)[number]) =>
                  formatDate(record.lastUsedAt),
              },
              {
                title: "Expires",
                key: "expiresAt",
                render: (_value: unknown, record: (typeof sessions)[number]) =>
                  formatDate(record.expiresAt),
              },
              {
                title: "Actions",
                key: "actions",
                render: (
                  _value: unknown,
                  record: (typeof sessions)[number],
                ) => (
                  <Button
                    danger
                    disabled={revokeSessionMutation.isPending}
                    onClick={async () => {
                      await revokeSessionMutation.mutateAsync({
                        sessionId: record.id,
                      });

                      if (record.isCurrent) {
                        logout();
                      }
                    }}
                  >
                    Revoke
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <Empty description="No active sessions found" />
        )}
      </Card>
    </InspectionRouteShell>
  );
}
