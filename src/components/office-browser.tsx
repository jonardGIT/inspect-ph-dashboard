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
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";

import { hasPermission } from "@/components/dashboard-app-shell";
import DashboardFilterStrip from "@/components/dashboard-filter-strip";
import DashboardMetricCard from "@/components/dashboard-metric-card";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { useOfficeBrowser } from "@/hooks/use-office-browser";
import { getApiErrorMessage } from "@/lib/api/http";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function OfficeBrowser() {
  const [form] = Form.useForm();
  const { activeCount, clearValues, page, setPage, setValue, values } =
    useBrowserQueryParams({
      keys: ["search", "lguId"] as const,
    });
  const { accessToken, session } = useAuthSession();
  const lguId = values.lguId;
  const search = values.search;
  const {
    archiveOfficeMutation,
    createOfficeMutation,
    lguOptionsQuery,
    officesQuery,
  } = useOfficeBrowser({
    accessToken,
    lguId: lguId || undefined,
    page,
    search: search || undefined,
  });

  const offices = officesQuery.data?.data ?? [];
  const lgus = lguOptionsQuery.data?.data ?? [];
  const meta = officesQuery.data?.meta;
  const activeLguName = lgus.find((item) => item.id === lguId)?.name || lguId;

  return (
    <InspectionRouteShell
      eyebrow="Platform administration"
      title="Offices"
      description="Manage office records that will later anchor assignment, role scoping, and operational supervision within each participating LGU."
      secondarySidebar={
        <Card title="Filters" className="glass-card dashboard-side-card">
          <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            <Input.Search
              allowClear
              placeholder="Search code, name, or description"
              value={search}
              onChange={(event) => setValue("search", event.target.value)}
              onSearch={(value) => setValue("search", value)}
            />
            <Select
              allowClear
              placeholder="Filter by LGU"
              options={lgus.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              value={lguId || undefined}
              onChange={(value) => setValue("lguId", value ?? "")}
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
          {activeLguName ? <Tag color="blue">LGU: {activeLguName}</Tag> : null}
        </DashboardFilterStrip>
      ) : null}

      <Row gutter={[16, 16]} className="dashboard-summary-row">
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Visible offices"
            value={offices.length}
            description="Current page inventory"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            accent
            label="Active filters"
            value={[search, lguId].filter(Boolean).length}
            description="Search and LGU scope"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Registered LGUs"
            value={lgus.length}
            description="Available office parents"
          />
        </Col>
      </Row>

      {officesQuery.error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          title={getApiErrorMessage(officesQuery.error)}
        />
      ) : null}

      <Card
        title="Office registry"
        className="glass-card dashboard-data-card"
        style={{ marginBottom: 20 }}
      >
        {officesQuery.isLoading ? null : offices.length ? (
          <>
            <Table
              className="dashboard-table"
              dataSource={offices}
              pagination={false}
              rowKey="id"
              scroll={{ x: true }}
              columns={[
                {
                  title: "Office",
                  key: "name",
                  render: (_value, record) => (
                    <Space orientation="vertical" size={0}>
                      <Typography.Text strong>{record.name}</Typography.Text>
                      <Typography.Text type="secondary">
                        {record.code}
                      </Typography.Text>
                    </Space>
                  ),
                },
                {
                  title: "LGU",
                  key: "lguId",
                  render: (_value, record) =>
                    lgus.find((item) => item.id === record.lguId)?.name ||
                    record.lguId,
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
                {
                  title: "Actions",
                  key: "actions",
                  render: (_value, record) =>
                    hasPermission(session, "office:manage") ? (
                      <Popconfirm
                        title="Archive this office?"
                        description="Archived offices are hidden from all lists. This cannot be undone."
                        okText="Archive"
                        okButtonProps={{ danger: true }}
                        onConfirm={() =>
                          archiveOfficeMutation.mutate({
                            accessToken,
                            id: record.id,
                          })
                        }
                      >
                        <Button size="small" danger>
                          Archive
                        </Button>
                      </Popconfirm>
                    ) : null,
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
          <Empty description="No offices found for the current filters" />
        )}
      </Card>

      {hasPermission(session, "office:manage") ? (
        <Card
          title="Register office"
          className="glass-card dashboard-form-card"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={async (formValues) => {
              await createOfficeMutation.mutateAsync({
                accessToken,
                code: formValues.code,
                description: formValues.description,
                lguId: formValues.lguId,
                name: formValues.name,
              });
              form.resetFields();
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Parent LGU"
                  name="lguId"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select an LGU"
                    options={lgus.map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Office code"
                  name="code"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Office name"
                  name="name"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Description" name="description">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Button
                htmlType="submit"
                type="primary"
                loading={createOfficeMutation.isPending}
              >
                Register office
              </Button>
              {createOfficeMutation.error ? (
                <Alert
                  type="error"
                  showIcon
                  title={getApiErrorMessage(createOfficeMutation.error)}
                />
              ) : null}
            </Space>
          </Form>
        </Card>
      ) : null}
    </InspectionRouteShell>
  );
}
