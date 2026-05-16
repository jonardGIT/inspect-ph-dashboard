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
import { useBusinessBrowser } from "@/hooks/use-business-browser";
import { getApiErrorMessage } from "@/lib/api/http";

import type { BusinessEstablishment } from "@shared/types/api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function BusinessBrowser() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editTarget, setEditTarget] = useState<BusinessEstablishment | null>(null);
  const { activeCount, clearValues, page, setPage, setValue, values } =
    useBrowserQueryParams({
      keys: ["search", "city", "barangay"] as const,
    });
  const { accessToken, session } = useAuthSession();
  const barangay = values.barangay;
  const city = values.city;
  const search = values.search;
  const { businessesQuery, createBusinessMutation, archiveBusinessMutation, updateBusinessMutation } = useBusinessBrowser({
    accessToken,
    barangay: barangay || undefined,
    city: city || undefined,
    page,
    search: search || undefined,
  });

  const businesses = businessesQuery.data?.data ?? [];
  const meta = businessesQuery.data?.meta;

  return (
    <InspectionRouteShell
      eyebrow="BPLO business registry"
      title="Businesses"
      description="Browse registered business establishments, filter by location, search by owner or business name, and register new establishments when signed in as an admin."
      secondarySidebar={
        <Card title="Filters" className="glass-card dashboard-side-card">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Input.Search
              allowClear
              placeholder="Search business or owner"
              value={search}
              onChange={(event) => setValue("search", event.target.value)}
              onSearch={(value) => setValue("search", value)}
            />
            <Input
              placeholder="City"
              value={city}
              onChange={(event) => setValue("city", event.target.value)}
            />
            <Input
              placeholder="Barangay"
              value={barangay}
              onChange={(event) => setValue("barangay", event.target.value)}
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
          {city ? <Tag color="gold">City: {city}</Tag> : null}
          {barangay ? <Tag color="blue">Barangay: {barangay}</Tag> : null}
        </DashboardFilterStrip>
      ) : null}

      <Row gutter={[16, 16]} className="dashboard-summary-row">
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Visible records"
            value={businesses.length}
            description="Current page inventory"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            accent
            label="Active filters"
            value={[search, city, barangay].filter(Boolean).length}
            description="Search, city, and barangay inputs"
          />
        </Col>
        <Col xs={24} md={8}>
          <DashboardMetricCard
            label="Operator access"
            value={
              hasPermission(session, "business:create") ? "Admin" : "Viewer"
            }
            description="New registrations require admin role"
          />
        </Col>
      </Row>

      {businessesQuery.error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          message={getApiErrorMessage(businessesQuery.error)}
        />
      ) : null}

      <Card
        title="Business registry"
        className="glass-card dashboard-data-card"
        style={{ marginBottom: 20 }}
      >
        {businessesQuery.isLoading ? null : businesses.length ? (
          <>
            <Table
              className="dashboard-table"
              dataSource={businesses}
              pagination={false}
              rowKey="id"
              scroll={{ x: true }}
              columns={[
                {
                  title: "Business",
                  key: "businessName",
                  render: (_value, record) => (
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>
                        {record.businessName}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {record.tradeName || record.ownerName}
                      </Typography.Text>
                    </Space>
                  ),
                },
                {
                  title: "Owner",
                  dataIndex: "ownerName",
                  key: "ownerName",
                },
                {
                  title: "Location",
                  key: "location",
                  render: (_value, record) =>
                    `${record.addressLine}, ${record.barangay}, ${record.city}`,
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
                    hasPermission(session, "business:manage") ? (
                      <Space size="small">
                        {hasPermission(session, "business:update") ? (
                          <Button
                            size="small"
                            onClick={() => {
                              setEditTarget(record);
                              editForm.setFieldsValue({
                                businessName: record.businessName,
                                ownerName: record.ownerName,
                                tradeName: record.tradeName,
                                contactNumber: record.contactNumber,
                                addressLine: record.addressLine,
                                barangay: record.barangay,
                                city: record.city,
                                province: record.province,
                                taxIdentificationNumber:
                                  record.taxIdentificationNumber,
                              });
                            }}
                          >
                            Edit
                          </Button>
                        ) : null}
                        <Popconfirm
                          title="Archive this business?"
                          description="Archived businesses are hidden from all lists. This cannot be undone."
                          okText="Archive"
                          okButtonProps={{ danger: true }}
                          onConfirm={() =>
                            archiveBusinessMutation.mutate({
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
          <Empty description="No businesses found for the current filters" />
        )}
      </Card>

      {hasPermission(session, "business:create") ? (
        <Card
          title="Register business"
          className="glass-card dashboard-form-card"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              await createBusinessMutation.mutateAsync({
                accessToken,
                addressLine: values.addressLine,
                barangay: values.barangay,
                businessName: values.businessName,
                city: values.city,
                contactNumber: values.contactNumber,
                ownerName: values.ownerName,
                province: values.province,
                taxIdentificationNumber: values.taxIdentificationNumber,
                tradeName: values.tradeName,
              });
              form.resetFields();
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Business name"
                  name="businessName"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Trade name" name="tradeName">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Owner name"
                  name="ownerName"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Contact number" name="contactNumber">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  label="Address line"
                  name="addressLine"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Barangay"
                  name="barangay"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Province"
                  name="province"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="TIN" name="taxIdentificationNumber">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Button
                htmlType="submit"
                type="primary"
                loading={createBusinessMutation.isPending}
              >
                Register business
              </Button>
              {createBusinessMutation.error ? (
                <Alert
                  type="error"
                  showIcon
                  message={getApiErrorMessage(createBusinessMutation.error)}
                />
              ) : null}
            </Space>
          </Form>
        </Card>
      ) : null}

      <Modal
        title="Edit business"
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
              await updateBusinessMutation.mutateAsync({
                accessToken,
                id: editTarget.id,
                businessName: values.businessName,
                ownerName: values.ownerName,
                tradeName: values.tradeName || null,
                contactNumber: values.contactNumber || null,
                addressLine: values.addressLine,
                barangay: values.barangay,
                city: values.city,
                province: values.province,
                taxIdentificationNumber:
                  values.taxIdentificationNumber || null,
              });
              setEditTarget(null);
              editForm.resetFields();
            }}
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="Business name" name="businessName" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Trade name" name="tradeName">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Owner name" name="ownerName" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Contact number" name="contactNumber">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="Address line" name="addressLine" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Barangay" name="barangay" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="City" name="city" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Province" name="province" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="TIN" name="taxIdentificationNumber">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Button
                htmlType="submit"
                type="primary"
                loading={updateBusinessMutation.isPending}
              >
                Save changes
              </Button>
              {updateBusinessMutation.error ? (
                <Alert
                  type="error"
                  showIcon
                  message={getApiErrorMessage(updateBusinessMutation.error)}
                />
              ) : null}
            </Space>
          </Form>
        ) : null}
      </Modal>
    </InspectionRouteShell>
  );
}
