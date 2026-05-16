"use client";

import {
  Badge,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import {
  useDataSubjectRequests,
  useUpdateDataSubjectRequest,
} from "@/hooks/use-data-subject-requests";
import { getApiErrorMessage } from "@/lib/api/http";
import type {
  DataSubjectRequestRecord,
  DataSubjectRequestStatus,
  DataSubjectRequestType,
} from "@shared/types/api";

const { Text, Title } = Typography;

const STATUS_COLORS: Record<DataSubjectRequestStatus, string> = {
  COMPLETED: "success",
  IN_REVIEW: "processing",
  PENDING: "default",
  REJECTED: "error",
  WITHDRAWN: "default",
};

const TYPE_LABELS: Record<DataSubjectRequestType, string> = {
  ACCESS: "Access",
  CORRECTION: "Correction",
  ERASURE: "Erasure",
};

const STATUS_OPTIONS: { label: string; value: DataSubjectRequestStatus }[] = [
  { label: "In review", value: "IN_REVIEW" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Rejected", value: "REJECTED" },
];

interface ResolveFormValues {
  status: DataSubjectRequestStatus;
  response: string;
}

export default function PrivacyRequestsTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    DataSubjectRequestStatus | undefined
  >();
  const [typeFilter, setTypeFilter] = useState<
    DataSubjectRequestType | undefined
  >();
  const [selectedRequest, setSelectedRequest] =
    useState<DataSubjectRequestRecord | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [form] = Form.useForm<ResolveFormValues>();

  const limit = 20;
  const offset = (page - 1) * limit;

  const query = useDataSubjectRequests({
    limit,
    offset,
    status: statusFilter,
    type: typeFilter,
  });

  const updateMutation = useUpdateDataSubjectRequest();

  const handleResolve = async (values: ResolveFormValues) => {
    if (!selectedRequest) return;
    setResolving(true);
    setResolveError(null);
    try {
      await updateMutation.mutateAsync({
        id: selectedRequest.id,
        response: values.response,
        status: values.status,
      });
      setSelectedRequest(null);
    } catch (err) {
      setResolveError(getApiErrorMessage(err));
    } finally {
      setResolving(false);
    }
  };

  const columns: ColumnsType<DataSubjectRequestRecord> = [
    {
      dataIndex: "type",
      key: "type",
      render: (type: DataSubjectRequestType) => <Tag>{TYPE_LABELS[type]}</Tag>,
      title: "Type",
    },
    {
      dataIndex: "email",
      key: "email",
      render: (email: string) => <Text copyable>{email}</Text>,
      title: "Email",
    },
    {
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      title: "Description",
    },
    {
      dataIndex: "status",
      key: "status",
      render: (status: DataSubjectRequestStatus) => (
        <Badge
          status={
            STATUS_COLORS[status] as
              | "success"
              | "processing"
              | "default"
              | "error"
          }
          text={status.replace("_", " ")}
        />
      ),
      title: "Status",
    },
    {
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
      title: "Submitted",
    },
    {
      key: "actions",
      render: (_: unknown, record: DataSubjectRequestRecord) => (
        <Button
          size="small"
          onClick={() => {
            setSelectedRequest(record);
            form.setFieldsValue({
              response: record.response ?? "",
              status: record.status as DataSubjectRequestStatus,
            });
          }}
          disabled={["COMPLETED", "REJECTED", "WITHDRAWN"].includes(
            record.status,
          )}
        >
          Review
        </Button>
      ),
      title: "Action",
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          allowClear
          placeholder="Filter by type"
          style={{ width: 160 }}
          value={typeFilter}
          onChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}
          options={[
            { label: "Access", value: "ACCESS" },
            { label: "Correction", value: "CORRECTION" },
            { label: "Erasure", value: "ERASURE" },
          ]}
        />
        <Select
          allowClear
          placeholder="Filter by status"
          style={{ width: 160 }}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          options={[
            { label: "Pending", value: "PENDING" },
            { label: "In review", value: "IN_REVIEW" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Rejected", value: "REJECTED" },
            { label: "Withdrawn", value: "WITHDRAWN" },
          ]}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={query.data?.data ?? []}
        loading={query.isLoading}
        rowKey="id"
        pagination={{
          current: page,
          onChange: setPage,
          pageSize: limit,
          total: query.data?.meta?.total ?? 0,
        }}
        size="small"
      />

      <Drawer
        title="Review data subject request"
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        width={480}
        footer={null}
      >
        {selectedRequest && (
          <>
            <Descriptions
              column={1}
              size="small"
              bordered
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Type">
                {TYPE_LABELS[selectedRequest.type]}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedRequest.email}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted">
                {new Date(selectedRequest.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedRequest.description}
              </Descriptions.Item>
            </Descriptions>

            {resolveError && (
              <Text
                type="danger"
                style={{ display: "block", marginBottom: 12 }}
              >
                {resolveError}
              </Text>
            )}

            <Form form={form} layout="vertical" onFinish={handleResolve}>
              <Form.Item
                name="status"
                label="Update status"
                rules={[{ required: true }]}
              >
                <Select options={STATUS_OPTIONS} />
              </Form.Item>
              <Form.Item
                name="response"
                label="Response to requester"
                rules={[
                  { required: true, message: "Please provide a response" },
                ]}
              >
                <Input.TextArea rows={4} maxLength={5000} showCount />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={resolving}
                  block
                >
                  Save
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Drawer>
    </>
  );
}
