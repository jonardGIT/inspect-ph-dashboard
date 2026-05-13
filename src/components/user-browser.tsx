"use client";

import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Pagination,
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
import { useUserBrowser } from "@/hooks/use-user-browser";
import { getApiErrorMessage } from "@/lib/api/http";

const roleOptions = [
  { label: "All roles", value: "all" },
  { label: "Admin", value: "admin" },
  { label: "Inspector", value: "inspector" },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRoleLabel(value: (typeof roleOptions)[number]["value"]) {
  return roleOptions.find((option) => option.value === value)?.label ?? value;
}

export default function UserBrowser() {
  const { activeCount, clearValues, page, setPage, setValue, values } =
    useBrowserQueryParams({
      defaults: { role: "all" },
      keys: ["role", "search", "userId"] as const,
    });
  const { accessToken, session } = useAuthSession();
  const role = values.role as "all" | "admin" | "inspector";
  const search = values.search;
  const selectedUserId = values.userId;
  const {
    assignmentsQuery,
    createAssignmentMutation,
    deleteAssignmentMutation,
    officesQuery,
    usersQuery,
  } = useUserBrowser({
    accessToken,
    page,
    role: role === "all" ? undefined : role,
    search: search || undefined,
    selectedUserId: selectedUserId || undefined,
  });

  const users = usersQuery.data?.data ?? [];
  const offices = officesQuery.data?.data ?? [];
  const assignments = assignmentsQuery.data ?? [];
  const meta = usersQuery.data?.meta;
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;

  return (
    <InspectionRouteShell
      eyebrow="Platform administration"
      title="Users"
      description="Review authenticated users and manage which office queues they can operate within as Phase 3 scoping comes online."
      secondarySidebar={
        <Card title="Filters" className="glass-card dashboard-side-card">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Select
              options={roleOptions.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              value={role}
              onChange={(value) => setValue("role", value)}
            />
            <Select
              showSearch
              allowClear
              placeholder="Select user to manage"
              options={users.map((user) => ({
                label: `${user.name} · ${user.email}`,
                value: user.id,
              }))}
              value={selectedUserId || undefined}
              onChange={(value) => setValue("userId", value ?? "")}
            />
            <Select
              showSearch
              allowClear
              placeholder="Search by picking a matching user"
              options={users.map((user) => ({
                label: `${user.name} · ${user.email}`,
                value: user.name,
              }))}
              value={search || undefined}
              onChange={(value) => setValue("search", value ?? "")}
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
          {role !== "all" ? (
            <Tag color="gold">Role: {formatRoleLabel(role)}</Tag>
          ) : null}
          {selectedUser ? (
            <Tag color="blue">User: {selectedUser.name}</Tag>
          ) : null}
          {search ? <Tag color="green">Search: {search}</Tag> : null}
        </DashboardFilterStrip>
      ) : null}

      <Row gutter={[16, 16]} className="dashboard-summary-row">
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Visible users"
            value={users.length}
            description="Current page inventory"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            accent
            label="Selected user"
            value={selectedUser?.name ?? "None"}
            description="Assignment target"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Office options"
            value={offices.length}
            description="Assignable offices loaded"
          />
        </Col>
      </Row>

      {usersQuery.error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          message={getApiErrorMessage(usersQuery.error)}
        />
      ) : null}

      <Card
        title="User directory"
        className="glass-card dashboard-data-card"
        style={{ marginBottom: 20 }}
      >
        {usersQuery.isLoading ? null : users.length ? (
          <>
            <Table
              className="dashboard-table"
              dataSource={users}
              pagination={false}
              rowKey="id"
              scroll={{ x: true }}
              columns={[
                {
                  title: "User",
                  key: "name",
                  render: (_value, record) => (
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>{record.name}</Typography.Text>
                      <Typography.Text type="secondary">
                        {record.email}
                      </Typography.Text>
                    </Space>
                  ),
                },
                {
                  title: "Role",
                  dataIndex: "role",
                  key: "role",
                  render: (value: "admin" | "inspector") => (
                    <Tag color={value === "admin" ? "gold" : "blue"}>
                      {value}
                    </Tag>
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
                    <Button onClick={() => setValue("userId", record.id)}>
                      Manage assignments
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
          <Empty description="No users found for the current filters" />
        )}
      </Card>

      <Card
        title="Office assignments"
        className="glass-card dashboard-form-card"
      >
        {!selectedUser ? (
          <Empty description="Select a user to manage office assignments" />
        ) : (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Typography.Text>
              Managing assignments for <strong>{selectedUser.name}</strong>.
            </Typography.Text>
            <Space wrap>
              <Select
                showSearch
                placeholder="Select office to assign"
                style={{ minWidth: 280 }}
                options={offices.map((office) => ({
                  label: `${office.name} · ${office.code}`,
                  value: office.id,
                }))}
                onChange={(value) => {
                  if (!selectedUserId || !value) {
                    return;
                  }

                  createAssignmentMutation.mutate({
                    officeId: value,
                    userId: selectedUserId,
                  });
                }}
              />
            </Space>
            {assignmentsQuery.error ? (
              <Alert
                type="error"
                showIcon
                message={getApiErrorMessage(assignmentsQuery.error)}
              />
            ) : null}
            {createAssignmentMutation.error ? (
              <Alert
                type="error"
                showIcon
                message={getApiErrorMessage(createAssignmentMutation.error)}
              />
            ) : null}
            {deleteAssignmentMutation.error ? (
              <Alert
                type="error"
                showIcon
                message={getApiErrorMessage(deleteAssignmentMutation.error)}
              />
            ) : null}
            {assignmentsQuery.isLoading ? null : assignments.length ? (
              assignments.map((assignment) => (
                <ViewAssignmentRow
                  key={assignment.id}
                  assignmentId={assignment.id}
                  description={`${assignment.office.name} · ${assignment.office.code}`}
                  disabled={deleteAssignmentMutation.isPending}
                  onRemove={() => {
                    if (!selectedUserId) {
                      return;
                    }

                    deleteAssignmentMutation.mutate({
                      assignmentId: assignment.id,
                      userId: selectedUserId,
                    });
                  }}
                />
              ))
            ) : (
              <Empty description="No office assignments recorded for this user" />
            )}
          </Space>
        )}
      </Card>
    </InspectionRouteShell>
  );
}

function ViewAssignmentRow(input: {
  assignmentId: string;
  description: string;
  disabled: boolean;
  onRemove: () => void;
}) {
  return (
    <Card size="small">
      <Space
        align="center"
        style={{ justifyContent: "space-between", width: "100%" }}
        wrap
      >
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{input.description}</Typography.Text>
          <Typography.Text type="secondary">
            Assignment ID: {input.assignmentId}
          </Typography.Text>
        </Space>
        <Button danger disabled={input.disabled} onClick={input.onRemove}>
          Remove assignment
        </Button>
      </Space>
    </Card>
  );
}
