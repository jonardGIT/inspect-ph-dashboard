"use client";

import { useState } from "react";

import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import InspectionRouteShell from "@/components/inspection-route-shell";
import { hasPermission } from "@/components/dashboard-app-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useBrowserQueryParams } from "@/hooks/use-browser-query-params";
import { useCapBrowser } from "@/hooks/use-cap-browser";
import { getApiErrorMessage } from "@/lib/api/http";

import type { CorrectiveActionPlanRecord } from "@shared/types/api";

const { Text } = Typography;

const STATUS_COLOR: Record<CorrectiveActionPlanRecord["status"], string> = {
  open: "red",
  acknowledged: "orange",
  resolved: "green",
  escalated: "volcano",
};

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Open", value: "open" },
  { label: "Acknowledged", value: "acknowledged" },
  { label: "Resolved", value: "resolved" },
  { label: "Escalated", value: "escalated" },
];

export default function CapBrowser() {
  const { accessToken, session } = useAuthSession();
  const { values, setValue, setPage, page } = useBrowserQueryParams({
    keys: ["status"] as const,
  });
  const [statusModal, setStatusModal] = useState<{
    cap: CorrectiveActionPlanRecord;
  } | null>(null);

  const status =
    (values["status"] as CorrectiveActionPlanRecord["status"]) || undefined;
  const isOwner = session?.user.role === "business_owner";

  const { capsQuery, updateStatusMutation } = useCapBrowser({
    accessToken: accessToken,
    isOwner,
    page,
    status,
  });

  const canManage = session && hasPermission(session, "cap:manage");

  const canAcknowledge = session && hasPermission(session, "cap:acknowledge");

  const columns: ColumnsType<CorrectiveActionPlanRecord> = [
    {
      title: "Business",
      dataIndex: ["business", "businessName"],
      key: "business",
    },
    {
      title: "Finding",
      dataIndex: ["finding", "title"],
      key: "finding",
    },
    {
      title: "Severity",
      dataIndex: ["finding", "severity"],
      key: "severity",
      render: (v: string) => (
        <Tag
          color={v === "critical" ? "red" : v === "high" ? "orange" : "default"}
        >
          {v.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: CorrectiveActionPlanRecord["status"]) => (
        <Tag color={STATUS_COLOR[v]}>{v.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Deadline",
      dataIndex: "deadlineAt",
      key: "deadlineAt",
      render: (v?: string) =>
        v ? (
          new Date(v).toLocaleDateString("en-PH")
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const canUpdate =
          canManage || (canAcknowledge && record.status === "open");

        return canUpdate ? (
          <Button size="small" onClick={() => setStatusModal({ cap: record })}>
            Update Status
          </Button>
        ) : null;
      },
    },
  ];

  const data = capsQuery.data?.data ?? [];
  const total = capsQuery.data?.meta.total ?? 0;

  return (
    <InspectionRouteShell
      title="Corrective Action Plans"
      eyebrow="Compliance"
      description="Track and manage corrective action plans issued against inspection findings."
    >
      <Card
        extra={
          <Space>
            <Select
              options={STATUS_OPTIONS}
              value={status ?? ""}
              onChange={(v) => setValue("status", v)}
              style={{ width: 180 }}
            />
          </Space>
        }
      >
        {capsQuery.isError && (
          <Alert
            type="error"
            message={getApiErrorMessage(capsQuery.error)}
            style={{ marginBottom: 16 }}
          />
        )}

        {data.length === 0 && !capsQuery.isLoading ? (
          <Empty description="No corrective action plans found" />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            loading={capsQuery.isLoading}
            pagination={false}
            rowKey="id"
            size="small"
          />
        )}

        <Pagination
          current={page}
          pageSize={20}
          total={total}
          onChange={(p) => setPage(p)}
          showSizeChanger={false}
          style={{ marginTop: 16, textAlign: "right" }}
        />
      </Card>

      {/* Status update modal */}
      <Modal
        open={Boolean(statusModal)}
        title="Update CAP Status"
        onCancel={() => setStatusModal(null)}
        footer={null}
        destroyOnHidden
      >
        {statusModal && (
          <UpdateCapStatusForm
            cap={statusModal.cap}
            isAdmin={Boolean(canManage)}
            loading={updateStatusMutation.isPending}
            error={
              updateStatusMutation.isError
                ? getApiErrorMessage(updateStatusMutation.error)
                : null
            }
            onSubmit={async (values) => {
              await updateStatusMutation.mutateAsync({
                accessToken: accessToken,
                id: statusModal.cap.id,
                status: values.status,
                responseNote: values.responseNote,
              });
              setStatusModal(null);
            }}
          />
        )}
      </Modal>
    </InspectionRouteShell>
  );
}

function UpdateCapStatusForm({
  cap,
  isAdmin,
  loading,
  error,
  onSubmit,
}: {
  cap: CorrectiveActionPlanRecord;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  onSubmit: (values: {
    status: CorrectiveActionPlanRecord["status"];
    responseNote?: string;
  }) => Promise<void>;
}) {
  const [form] = Form.useForm();

  const adminStatuses = STATUS_OPTIONS.filter((o) => o.value !== "");
  const ownerStatuses = STATUS_OPTIONS.filter(
    (o) => o.value === "acknowledged",
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={{ status: cap.status }}
    >
      {error && (
        <Alert type="error" message={error} style={{ marginBottom: 16 }} />
      )}
      <Form.Item name="status" label="New Status" rules={[{ required: true }]}>
        <Select options={isAdmin ? adminStatuses : ownerStatuses} />
      </Form.Item>
      <Form.Item name="responseNote" label="Response Note">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loading} block>
        Save
      </Button>
    </Form>
  );
}
