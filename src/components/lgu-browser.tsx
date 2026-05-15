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
import { useLguBrowser } from "@/hooks/use-lgu-browser";
import { getApiErrorMessage } from "@/lib/api/http";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function LguBrowser() {
  const [form] = Form.useForm();
  const { activeCount, clearValues, page, setPage, setValue, values } =
    useBrowserQueryParams({
      keys: ["search"] as const,
    });
  const { accessToken, session } = useAuthSession();
  const search = values.search;
  const { archiveLguMutation, createLguMutation, lgusQuery } = useLguBrowser({
    accessToken,
    page,
    search: search || undefined,
  });

  const lgus = lgusQuery.data?.data ?? [];
  const meta = lgusQuery.data?.meta;

  return (
    <InspectionRouteShell
      eyebrow="Platform administration"
      title="LGUs"
      description="Manage local government units that will later anchor office boundaries, user assignment, and scope-aware access across the platform."
      secondarySidebar={
        <Card title="Filters" className="glass-card dashboard-side-card">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Input.Search
              allowClear
              placeholder="Search code, name, or locality"
              value={search}
              onChange={(event) => setValue("search", event.target.value)}
              onSearch={(value) => setValue("search", value)}
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
        </DashboardFilterStrip>
      ) : null}

      <Row gutter={[16, 16]} className="dashboard-summary-row">
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Visible LGUs"
            value={lgus.length}
            description="Current page inventory"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            accent
            label="Active filters"
            value={search ? 1 : 0}
            description="Search input state"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Operator access"
            value={session?.user.role === "admin" ? "Admin" : "Viewer"}
            description="Creating LGUs requires admin role"
          />
        </Col>
      </Row>

      {lgusQuery.error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          message={getApiErrorMessage(lgusQuery.error)}
        />
      ) : null}

      <Card
        title="LGU registry"
        className="glass-card dashboard-data-card"
        style={{ marginBottom: 20 }}
      >
        {lgusQuery.isLoading ? null : lgus.length ? (
          <>
            <Table
              className="dashboard-table"
              dataSource={lgus}
              pagination={false}
              rowKey="id"
              scroll={{ x: true }}
              columns={[
                {
                  title: "LGU",
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
                  title: "Location",
                  key: "location",
                  render: (_value, record) =>
                    [record.city, record.province, record.region]
                      .filter(Boolean)
                      .join(", ") || "No locality captured",
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
                    session?.user.role === "admin" ? (
                      <Popconfirm
                        title="Archive this LGU?"
                        description="Archived LGUs are hidden from all lists. This cannot be undone."
                        okText="Archive"
                        okButtonProps={{ danger: true }}
                        onConfirm={() =>
                          archiveLguMutation.mutate({
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
          <Empty description="No LGUs found for the current filters" />
        )}
      </Card>

      {session?.user.role === "admin" ? (
        <Card title="Register LGU" className="glass-card dashboard-form-card">
          <Form
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              await createLguMutation.mutateAsync({
                accessToken,
                city: values.city,
                code: values.code,
                name: values.name,
                province: values.province,
                region: values.region,
              });
              form.resetFields();
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="LGU code"
                  name="code"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={16}>
                <Form.Item
                  label="LGU name"
                  name="name"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Region" name="region">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Province" name="province">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="City" name="city">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Button
                htmlType="submit"
                type="primary"
                loading={createLguMutation.isPending}
              >
                Register LGU
              </Button>
              {createLguMutation.error ? (
                <Alert
                  type="error"
                  showIcon
                  message={getApiErrorMessage(createLguMutation.error)}
                />
              ) : null}
            </Space>
          </Form>
        </Card>
      ) : null}
    </InspectionRouteShell>
  );
}
