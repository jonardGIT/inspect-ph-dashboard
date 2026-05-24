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
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";

import DashboardFilterStrip from "@/components/dashboard-filter-strip";
import DashboardMetricCard from "./dashboard-metric-card";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { hasPermission } from "@/components/dashboard-app-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { usePermitBrowser } from "@/hooks/use-permit-browser";
import { getApiErrorMessage } from "@/lib/api/http";

import type { PermitRecord } from "@shared/types/api";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending inspection", value: "pending_inspection" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
] as const;

const statusColors: Record<string, string> = {
  approved: "green",
  draft: "default",
  expired: "red",
  pending_inspection: "gold",
  rejected: "volcano",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function PermitBrowser() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editTarget, setEditTarget] = useState<PermitRecord | null>(null);
  const { activeCount, clearValues, page, setPage, setValue, values } =
    useBrowserQueryParams({
      defaults: { status: "all" },
      keys: ["businessId", "status"] as const,
    });
  const { accessToken, session } = useAuthSession();
  const businessId = values.businessId;
  const status = values.status as (typeof statusOptions)[number]["value"];
  const { createPermitMutation, archivePermitMutation, permitsQuery, updatePermitMutation } = usePermitBrowser({
    accessToken,
    businessId: businessId || undefined,
    page,
    status: status === "all" ? undefined : status,
  });

  const permits = permitsQuery.data?.data ?? [];
  const meta = permitsQuery.data?.meta;

  return (
    <InspectionRouteShell
      eyebrow="BPLO permit registry"
      title="Permits"
      description="Browse permit records, filter by status or business, and create permit records for registered establishments when signed in as an admin."
      secondarySidebar={
        <Card title="Filters" className="glass-card dashboard-side-card">
          <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            <Input
              placeholder="Business UUID"
              value={businessId}
              onChange={(event) => setValue("businessId", event.target.value)}
            />
            <Select
              value={status}
              options={
                statusOptions as unknown as { label: string; value: string }[]
              }
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
          {businessId ? <Tag color="blue">Business: {businessId}</Tag> : null}
          {status !== "all" ? (
            <Tag color="gold">Status: {status.replace("_", " ")}</Tag>
          ) : null}
        </DashboardFilterStrip>
      ) : null}

      <Row gutter={[16, 16]} className="dashboard-summary-row">
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Visible permits"
            value={permits.length}
            description="Current result window"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            accent
            label="Status focus"
            value={status === "all" ? "Mixed" : status.replace("_", " ")}
            description="Active workflow filter"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Ready to create"
            value={hasPermission(session, "permit:create") ? "Yes" : "No"}
            description="Permit issuance needs admin access"
          />
        </Col>
      </Row>

      {permitsQuery.error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          title={getApiErrorMessage(permitsQuery.error)}
        />
      ) : null}

      <Card
        title="Permit records"
        className="glass-card dashboard-data-card"
        style={{ marginBottom: 20 }}
      >
        {permitsQuery.isLoading ? null : permits.length ? (
          <>
            <Table
              className="dashboard-table"
              dataSource={permits}
              pagination={false}
              rowKey="id"
              scroll={{ x: true }}
              columns={[
                {
                  title: "Permit",
                  key: "permitNumber",
                  render: (_value, record) => (
                    <Space orientation="vertical" size={0}>
                      <Typography.Text strong>
                        {record.permitNumber}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {record.lineOfBusiness}
                      </Typography.Text>
                    </Space>
                  ),
                },
                {
                  title: "Business",
                  dataIndex: ["business", "businessName"],
                  key: "business",
                },
                {
                  title: "Application",
                  key: "applicationDate",
                  render: (_value, record) =>
                    formatDate(record.applicationDate),
                },
                {
                  title: "Expiration",
                  key: "expirationDate",
                  render: (_value, record) => formatDate(record.expirationDate),
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
                  title: "Actions",
                  key: "actions",
                  render: (_value, record) =>
                    hasPermission(session, "permit:manage") ? (
                      <Space size="small">
                        {hasPermission(session, "permit:update") ? (
                          <Button
                            size="small"
                            onClick={() => {
                              setEditTarget(record);
                              editForm.setFieldsValue({
                                lineOfBusiness: record.lineOfBusiness,
                                permitNumber: record.permitNumber,
                                applicationDate: record.applicationDate,
                                expirationDate: record.expirationDate,
                              });
                            }}
                          >
                            Edit
                          </Button>
                        ) : null}
                        <Popconfirm
                          title="Archive this permit?"
                          description="Archived permits are hidden from all lists. This cannot be undone."
                          okText="Archive"
                          okButtonProps={{ danger: true }}
                          onConfirm={() =>
                            archivePermitMutation.mutate({
                              accessToken,
                              id: record.id,
                            })
                          }
                        >
                          <Button size="small" danger>
                            Archive
                          </Button>
                        </Popconfirm>
                      </Space>
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
          <Empty description="No permits found for the current filters" />
        )}
      </Card>

      {hasPermission(session, "permit:create") ? (
        <Card title="Create permit" className="glass-card dashboard-form-card">
          <Form
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              await createPermitMutation.mutateAsync({
                accessToken,
                applicationDate: values.applicationDate,
                businessId: values.businessId,
                expirationDate: values.expirationDate,
                lineOfBusiness: values.lineOfBusiness,
                permitNumber: values.permitNumber,
              });
              form.resetFields();
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Business UUID"
                  name="businessId"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Permit number"
                  name="permitNumber"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Application date"
                  name="applicationDate"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="2026-05-13T08:00:00.000Z" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Expiration date"
                  name="expirationDate"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="2027-05-13T08:00:00.000Z" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  label="Line of business"
                  name="lineOfBusiness"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Button
                htmlType="submit"
                type="primary"
                loading={createPermitMutation.isPending}
              >
                Create permit
              </Button>
              {createPermitMutation.error ? (
                <Alert
                  type="error"
                  showIcon
                  title={getApiErrorMessage(createPermitMutation.error)}
                />
              ) : null}
            </Space>
          </Form>
        </Card>
      ) : null}

      <Modal
        title="Edit permit"
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
              await updatePermitMutation.mutateAsync({
                accessToken,
                id: editTarget.id,
                lineOfBusiness: values.lineOfBusiness,
                permitNumber: values.permitNumber,
                applicationDate: values.applicationDate,
                expirationDate: values.expirationDate,
              });
              setEditTarget(null);
              editForm.resetFields();
            }}
          >
            <Form.Item label="Permit number" name="permitNumber" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Line of business" name="lineOfBusiness" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Application date (ISO)" name="applicationDate" rules={[{ required: true }]}>
              <Input placeholder="2025-01-15T00:00:00.000Z" />
            </Form.Item>
            <Form.Item label="Expiration date (ISO)" name="expirationDate" rules={[{ required: true }]}>
              <Input placeholder="2027-01-14T00:00:00.000Z" />
            </Form.Item>
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Button
                htmlType="submit"
                type="primary"
                loading={updatePermitMutation.isPending}
              >
                Save changes
              </Button>
              {updatePermitMutation.error ? (
                <Alert
                  type="error"
                  showIcon
                  title={getApiErrorMessage(updatePermitMutation.error)}
                />
              ) : null}
            </Space>
          </Form>
        ) : null}
      </Modal>
    </InspectionRouteShell>
  );
}
