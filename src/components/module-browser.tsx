"use client";

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
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";

import DashboardFilterStrip from "@/components/dashboard-filter-strip";
import DashboardMetricCard from "@/components/dashboard-metric-card";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { useModuleBrowser } from "@/hooks/use-module-browser";
import { getApiErrorMessage } from "@/lib/api/http";

const statusOptions = [
  { label: "All modules", value: "all" },
  { label: "Active only", value: "active" },
  { label: "Inactive only", value: "inactive" },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ModuleBrowser() {
  const [form] = Form.useForm();
  const { activeCount, clearValues, page, setPage, setValue, values } =
    useBrowserQueryParams({
      defaults: { status: "all" },
      keys: ["search", "status"] as const,
    });
  const { accessToken, session } = useAuthSession();
  const search = values.search;
  const status = values.status as "all" | "active" | "inactive";
  const { createModuleMutation, modulesQuery } = useModuleBrowser({
    accessToken,
    isActive: status === "all" ? undefined : status === "active",
    page,
    search: search || undefined,
  });

  const modules = modulesQuery.data?.data ?? [];
  const meta = modulesQuery.data?.meta;

  return (
    <InspectionRouteShell
      eyebrow="Platform administration"
      title="Modules"
      description="Manage reusable module overlays that sit on top of the shared inspection core before office-level enablement is configured."
      secondarySidebar={
        <Card title="Filters" className="glass-card dashboard-side-card">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Input.Search
              allowClear
              placeholder="Search code or module name"
              value={search}
              onChange={(event) => setValue("search", event.target.value)}
              onSearch={(value) => setValue("search", value)}
            />
            <Select
              options={statusOptions.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              value={status}
              onChange={(value) => setValue("status", value)}
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
          {search ? <Tag color="green">Search: {search}</Tag> : null}
          {status !== "all" ? <Tag color="gold">Status: {status}</Tag> : null}
        </DashboardFilterStrip>
      ) : null}

      <Row gutter={[16, 16]} className="dashboard-summary-row">
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Visible modules"
            value={modules.length}
            description="Current page inventory"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            accent
            label="Active filters"
            value={
              [search, status !== "all" ? status : ""].filter(Boolean).length
            }
            description="Search and status scope"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Active modules"
            value={modules.filter((item) => item.isActive).length}
            description="Current page active count"
          />
        </Col>
      </Row>

      {modulesQuery.error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          message={getApiErrorMessage(modulesQuery.error)}
        />
      ) : null}

      <Card
        title="Module registry"
        className="glass-card dashboard-data-card"
        style={{ marginBottom: 20 }}
      >
        {modulesQuery.isLoading ? null : modules.length ? (
          <>
            <Table
              className="dashboard-table"
              dataSource={modules}
              pagination={false}
              rowKey="id"
              scroll={{ x: true }}
              columns={[
                {
                  title: "Module",
                  key: "name",
                  render: (_value, record) => (
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>{record.name}</Typography.Text>
                      <Typography.Text type="secondary">
                        {record.code}
                      </Typography.Text>
                    </Space>
                  ),
                },
                {
                  title: "Status",
                  key: "isActive",
                  render: (_value, record) => (
                    <Tag color={record.isActive ? "green" : "default"}>
                      {record.isActive ? "active" : "inactive"}
                    </Tag>
                  ),
                },
                {
                  title: "Description",
                  dataIndex: "description",
                  key: "description",
                  render: (value: string | undefined) =>
                    value || "No description",
                },
                {
                  title: "Created",
                  key: "createdAt",
                  render: (_value, record) => formatDate(record.createdAt),
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
          <Empty description="No modules found for the current filters" />
        )}
      </Card>

      {session?.user.role === "admin" ? (
        <Card
          title="Register module"
          className="glass-card dashboard-form-card"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ isActive: true }}
            onFinish={async (formValues) => {
              await createModuleMutation.mutateAsync({
                accessToken,
                code: formValues.code,
                description: formValues.description,
                isActive: Boolean(formValues.isActive),
                name: formValues.name,
              });
              form.resetFields();
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Module code"
                  name="code"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Module name"
                  name="name"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={18}>
                <Form.Item label="Description" name="description">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  label="Active"
                  name="isActive"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Button
                htmlType="submit"
                type="primary"
                loading={createModuleMutation.isPending}
              >
                Register module
              </Button>
              {createModuleMutation.error ? (
                <Alert
                  type="error"
                  showIcon
                  message={getApiErrorMessage(createModuleMutation.error)}
                />
              ) : null}
            </Space>
          </Form>
        </Card>
      ) : null}
    </InspectionRouteShell>
  );
}
