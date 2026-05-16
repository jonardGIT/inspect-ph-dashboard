"use client";

import { useState } from "react";

import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
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
import { hasPermission } from "@/components/dashboard-app-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { useChecklistTemplateBrowser } from "@/hooks/use-checklist-template-browser";
import { getApiErrorMessage } from "@/lib/api/http";

import type { ChecklistTemplateRecord } from "@shared/types/api";

const MODULE_OPTIONS = [
  { label: "All modules", value: "" },
  { label: "SanitaCheck (SANITA)", value: "SANITA" },
  { label: "BuildSure (BUILD)", value: "BUILD" },
  { label: "MarketGuard (MARKET)", value: "MARKET" },
  { label: "FireGuard (FIRE)", value: "FIRE" },
  { label: "EcoWatch (ECOWATCH)", value: "ECOWATCH" },
  { label: "ZoneVerify (ZONE)", value: "ZONE" },
  { label: "InfraInspect (INFRA)", value: "INFRA" },
  { label: "AgriCheck (AGRI)", value: "AGRI" },
  { label: "TourismSafe (TOURISM)", value: "TOURISM" },
  { label: "AssessPro (ASSESS)", value: "ASSESS" },
];

const statusOptions = [
  { label: "All templates", value: "all" },
  { label: "Active only", value: "active" },
  { label: "Inactive only", value: "inactive" },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ChecklistTemplateBrowser() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editTarget, setEditTarget] = useState<ChecklistTemplateRecord | null>(null);
  const { activeCount, clearValues, page, setPage, setValue, values } =
    useBrowserQueryParams({
      defaults: { module: "", status: "all" },
      keys: ["search", "status", "module"] as const,
    });
  const { accessToken, session } = useAuthSession();
  const search = values.search;
  const status = values.status as "all" | "active" | "inactive";
  const moduleFilter = values.module ?? "";
  const { createMutation, setActiveMutation, templatesQuery, updateMutation } =
    useChecklistTemplateBrowser({
      accessToken,
      isActive: status === "all" ? undefined : status === "active",
      module: moduleFilter || undefined,
      page,
      search: search || undefined,
    });

  const templates = templatesQuery.data?.data ?? [];
  const meta = templatesQuery.data?.meta;
  const isAdmin = hasPermission(session, "module:manage");

  return (
    <InspectionRouteShell
      eyebrow="Platform administration"
      title="Checklist templates"
      description="Manage reusable checklist templates that inspectors use to record structured compliance results during an inspection."
      secondarySidebar={
        <Card title="Filters" className="glass-card dashboard-side-card">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Input.Search
              allowClear
              placeholder="Search code or title"
              value={search}
              onChange={(event) => setValue("search", event.target.value)}
              onSearch={(value) => setValue("search", value)}
            />
            <Select
              style={{ width: "100%" }}
              options={MODULE_OPTIONS}
              value={moduleFilter}
              placeholder="Filter by module"
              onChange={(value) => setValue("module", value)}
            />
            <Select
              style={{ width: "100%" }}
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
          {moduleFilter ? <Tag color="blue">Module: {moduleFilter}</Tag> : null}
          {status !== "all" ? <Tag color="gold">Status: {status}</Tag> : null}
        </DashboardFilterStrip>
      ) : null}

      <Row gutter={[16, 16]} className="dashboard-summary-row">
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Visible templates"
            value={templates.length}
            description="Current page inventory"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            accent
            label="Active filters"
            value={
              [
                search,
                moduleFilter,
                status !== "all" ? status : "",
              ].filter(Boolean).length
            }
            description="Search and status scope"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Active templates"
            value={templates.filter((item) => item.isActive).length}
            description="Current page active count"
          />
        </Col>
      </Row>

      {templatesQuery.error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          message={getApiErrorMessage(templatesQuery.error)}
        />
      ) : null}

      <Card
        title="Checklist template registry"
        className="glass-card dashboard-data-card"
        style={{ marginBottom: 20 }}
      >
        {templatesQuery.isLoading ? null : templates.length ? (
          <>
            <Table
              className="dashboard-table"
              dataSource={templates}
              pagination={false}
              rowKey="id"
              scroll={{ x: true }}
              columns={[
                {
                  title: "Template",
                  key: "title",
                  render: (_value, record) => (
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>{record.title}</Typography.Text>
                      <Typography.Text type="secondary">
                        {record.code}
                      </Typography.Text>
                    </Space>
                  ),
                },
                {
                  title: "Module",
                  key: "module",
                  render: (_value, record) => (
                    <Tag color="blue">{record.module}</Tag>
                  ),
                },
                {
                  title: "Order",
                  dataIndex: "sortOrder",
                  key: "sortOrder",
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
                    value ?? "No description",
                },
                {
                  title: "Created",
                  key: "createdAt",
                  render: (_value, record) => formatDate(record.createdAt),
                },
                ...(isAdmin
                  ? [
                      {
                        title: "Actions",
                        key: "actions",
                        render: (_value: unknown, record: ChecklistTemplateRecord) => (
                          <Space size="small">
                            <Button
                              size="small"
                              onClick={() => {
                                setEditTarget(record);
                                editForm.setFieldsValue({
                                  title: record.title,
                                  description: record.description,
                                  sortOrder: record.sortOrder,
                                  isActive: record.isActive,
                                });
                              }}
                            >
                              Edit
                            </Button>
                            <Switch
                              checked={record.isActive}
                              loading={setActiveMutation.isPending}
                              onChange={(checked) => {
                                setActiveMutation.mutate({
                                  accessToken,
                                  id: record.id,
                                  isActive: checked,
                                });
                              }}
                            />
                          </Space>
                        ),
                      },
                    ]
                  : []),
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
          <Empty description="No checklist templates found for the current filters" />
        )}
      </Card>

      {isAdmin ? (
        <Card
          title="Create checklist template"
          className="glass-card dashboard-form-card"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ isActive: true, sortOrder: 0 }}
            onFinish={async (formValues) => {
              await createMutation.mutateAsync({
                accessToken,
                code: formValues.code,
                description: formValues.description,
                isActive: Boolean(formValues.isActive),
                module: formValues.module,
                sortOrder:
                  typeof formValues.sortOrder === "number"
                    ? formValues.sortOrder
                    : 0,
                title: formValues.title,
              });
              form.resetFields();
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Code"
                  name="code"
                  rules={[{ required: true, message: "Code is required" }]}
                >
                  <Input placeholder="e.g. SANITA_WATER_SUPPLY" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Module"
                  name="module"
                  rules={[{ required: true, message: "Module is required" }]}
                >
                  <Select
                    options={MODULE_OPTIONS.filter((opt) => opt.value)}
                    placeholder="Select module"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Sort order"
                  name="sortOrder"
                >
                  <Input type="number" min={0} />
                </Form.Item>
              </Col>
              <Col xs={24} md={16}>
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[{ required: true, message: "Title is required" }]}
                >
                  <Input placeholder="e.g. Water supply safety check" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Active" name="isActive" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="Description" name="description">
                  <Input.TextArea rows={3} placeholder="Optional description" />
                </Form.Item>
              </Col>
            </Row>
            <Button
              htmlType="submit"
              loading={createMutation.isPending}
              type="primary"
            >
              Create template
            </Button>
          </Form>
        </Card>
      ) : null}

      <Modal
        title="Edit checklist template"
        open={editTarget !== null}
        onCancel={() => {
          setEditTarget(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        {editTarget ? (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={async (values) => {
              await updateMutation.mutateAsync({
                accessToken,
                id: editTarget.id,
                title: values.title,
                description: values.description || null,
                sortOrder:
                  typeof values.sortOrder === "number"
                    ? values.sortOrder
                    : Number(values.sortOrder) || 0,
                isActive: Boolean(values.isActive),
              });
              setEditTarget(null);
              editForm.resetFields();
            }}
          >
            <Form.Item label="Title" name="title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Sort order" name="sortOrder">
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Button
                htmlType="submit"
                type="primary"
                loading={updateMutation.isPending}
              >
                Save changes
              </Button>
              {updateMutation.error ? (
                <Alert
                  type="error"
                  showIcon
                  message={getApiErrorMessage(updateMutation.error)}
                />
              ) : null}
            </Space>
          </Form>
        ) : null}
      </Modal>
    </InspectionRouteShell>
  );
}
