"use client";

import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Result,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useState } from "react";

import type { CrossLguRecognitionStatus, RecognitionRequest } from "@/types";
import {
  useCreateRecognitionRequest,
  usePendingConsentRequests,
  useRecognitionRequests,
  useResolveRecognitionRequest,
  useRespondToConsent,
  useVerifyRecognitionPayload,
} from "@/hooks/use-mutual-recognition";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getApiErrorMessage } from "@/lib/api/http";

const { Text } = Typography;

const STATUS_COLOR: Record<CrossLguRecognitionStatus, string> = {
  APPROVED: "success",
  CONSENT_GRANTED: "processing",
  EXPIRED: "default",
  PENDING_CONSENT: "warning",
  REJECTED: "error",
};

const STATUS_LABEL: Record<CrossLguRecognitionStatus, string> = {
  APPROVED: "Approved",
  CONSENT_GRANTED: "Consent granted",
  EXPIRED: "Expired",
  PENDING_CONSENT: "Pending consent",
  REJECTED: "Rejected",
};

function StatusTag({ status }: { status: CrossLguRecognitionStatus }) {
  return (
    <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status] ?? status}</Tag>
  );
}

function RequestTable({
  isBusinessOwner,
  loading,
  onConsent,
  onResolve,
  requests,
}: {
  isBusinessOwner: boolean;
  loading: boolean;
  onConsent: (id: string, decision: "grant" | "deny") => void;
  onResolve: (id: string, decision: "approve" | "reject") => void;
  requests: RecognitionRequest[];
}) {
  return (
    <Table<RecognitionRequest>
      dataSource={requests}
      loading={loading}
      pagination={{ pageSize: 20 }}
      rowKey="id"
      scroll={{ x: 900 }}
      size="small"
    >
      <Table.Column<RecognitionRequest>
        dataIndex="certificateNumber"
        key="certificateNumber"
        title="Certificate #"
      />
      <Table.Column<RecognitionRequest>
        dataIndex="businessName"
        key="businessName"
        title="Business"
      />
      <Table.Column<RecognitionRequest>
        key="requestingLgu"
        render={(_, row) => row.requestingLgu?.name ?? "—"}
        title="Requesting LGU"
      />
      <Table.Column<RecognitionRequest>
        key="issuingLgu"
        render={(_, row) => row.issuingLgu?.name ?? "—"}
        title="Issuing LGU"
      />
      <Table.Column<RecognitionRequest>
        key="status"
        render={(_, row) => <StatusTag status={row.status} />}
        title="Status"
      />
      <Table.Column<RecognitionRequest>
        key="compliance"
        render={(_, row) =>
          row.complianceScore !== null ? (
            <Tooltip title={`Grade: ${row.complianceGrade ?? "—"}`}>
              <Text>{row.complianceScore}%</Text>
            </Tooltip>
          ) : (
            "—"
          )
        }
        title="Score"
      />
      <Table.Column<RecognitionRequest>
        dataIndex="expiresAt"
        key="expiresAt"
        render={(v: string) => new Date(v).toLocaleDateString()}
        title="Expires"
      />
      <Table.Column<RecognitionRequest>
        key="actions"
        render={(_, row) => (
          <Space size="small">
            {isBusinessOwner && row.status === "PENDING_CONSENT" && (
              <>
                <Button
                  icon={<CheckOutlined />}
                  size="small"
                  type="primary"
                  onClick={() => onConsent(row.id, "grant")}
                >
                  Grant
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={() => onConsent(row.id, "deny")}
                >
                  Deny
                </Button>
              </>
            )}
            {!isBusinessOwner && row.status === "CONSENT_GRANTED" && (
              <>
                <Button
                  icon={<CheckCircleOutlined />}
                  size="small"
                  type="primary"
                  onClick={() => onResolve(row.id, "approve")}
                >
                  Approve
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={() => onResolve(row.id, "reject")}
                >
                  Reject
                </Button>
              </>
            )}
          </Space>
        )}
        title="Actions"
      />
    </Table>
  );
}

function VerifyPanel() {
  const [form] = Form.useForm<{
    signature: string;
    signedPayload: string;
  }>();
  const mutation = useVerifyRecognitionPayload();

  const onVerify = (values: { signature: string; signedPayload: string }) => {
    mutation.mutate({
      signature: values.signature,
      signedPayload: values.signedPayload,
    });
  };

  return (
    <Card size="small" title="Verify signed payload">
      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: 560 }}
        onFinish={onVerify}
      >
        <Form.Item
          label="Signed payload (JSON)"
          name="signedPayload"
          rules={[{ required: true }]}
        >
          <Input.TextArea autoSize={{ minRows: 4 }} />
        </Form.Item>
        <Form.Item
          label="Signature (hex)"
          name="signature"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" loading={mutation.isPending} type="primary">
            Verify
          </Button>
        </Form.Item>
      </Form>

      {mutation.isError && (
        <Alert
          description={getApiErrorMessage(mutation.error)}
          message="Verification failed"
          showIcon
          type="error"
        />
      )}

      {mutation.isSuccess && (
        <Result
          extra={
            <pre style={{ fontSize: 12, textAlign: "left" }}>
              {JSON.stringify(mutation.data.payload, null, 2)}
            </pre>
          }
          status={mutation.data.valid ? "success" : "error"}
          title={mutation.data.valid ? "Signature valid" : "Signature invalid"}
        />
      )}
    </Card>
  );
}

interface MutualRecognitionBrowserProps {}

export function MutualRecognitionBrowser(
  _: MutualRecognitionBrowserProps = {},
) {
  const { session } = useAuthSession();
  const isBusinessOwner = session?.user.role === "business_owner";
  const [roleFilter, setRoleFilter] = useState<
    "both" | "issuing" | "requesting"
  >("both");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm<{ certificateNumber: string }>();

  const { data: listData, isLoading } = useRecognitionRequests({
    role: roleFilter,
    status: statusFilter,
  });
  const { data: pendingData, isLoading: pendingLoading } =
    usePendingConsentRequests();
  const createMutation = useCreateRecognitionRequest();
  const consentMutation = useRespondToConsent();
  const resolveMutation = useResolveRecognitionRequest();

  const requests = listData?.data ?? [];
  const pendingRequests = pendingData ?? [];

  const handleConsent = (id: string, decision: "grant" | "deny") => {
    Modal.confirm({
      onOk: () => consentMutation.mutate({ decision, id }),
      title:
        decision === "grant"
          ? "Grant consent for this recognition request?"
          : "Deny this recognition request?",
    });
  };

  const handleResolve = (id: string, decision: "approve" | "reject") => {
    Modal.confirm({
      onOk: () => resolveMutation.mutate({ decision, id }),
      title:
        decision === "approve"
          ? "Approve this recognition request?"
          : "Reject this recognition request?",
    });
  };

  const handleCreate = (values: { certificateNumber: string }) => {
    createMutation.mutate(values.certificateNumber, {
      onSuccess: () => {
        setCreateOpen(false);
        createForm.resetFields();
      },
    });
  };

  const tabItems = [
    {
      children: (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space wrap>
            {!isBusinessOwner && (
              <Select
                allowClear
                options={[
                  { label: "Both", value: "both" },
                  { label: "Outgoing (requesting)", value: "requesting" },
                  { label: "Incoming (issuing)", value: "issuing" },
                ]}
                placeholder="Direction"
                style={{ width: 180 }}
                value={roleFilter}
                onChange={(v) =>
                  setRoleFilter((v as typeof roleFilter) ?? "both")
                }
              />
            )}
            <Select
              allowClear
              options={[
                { label: "Pending consent", value: "PENDING_CONSENT" },
                { label: "Consent granted", value: "CONSENT_GRANTED" },
                { label: "Approved", value: "APPROVED" },
                { label: "Rejected", value: "REJECTED" },
                { label: "Expired", value: "EXPIRED" },
              ]}
              placeholder="Filter by status"
              style={{ width: 180 }}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as string | undefined)}
            />
          </Space>
          <RequestTable
            isBusinessOwner={isBusinessOwner}
            loading={isLoading}
            requests={requests}
            onConsent={handleConsent}
            onResolve={handleResolve}
          />
        </Space>
      ),
      key: "all",
      label: "All requests",
    },
    ...(isBusinessOwner
      ? [
          {
            children: (
              <RequestTable
                isBusinessOwner
                loading={pendingLoading}
                requests={pendingRequests}
                onConsent={handleConsent}
                onResolve={handleResolve}
              />
            ),
            key: "pending",
            label: (
              <Space>
                Pending my consent
                {pendingRequests.length > 0 && (
                  <Tag color="warning">{pendingRequests.length}</Tag>
                )}
              </Space>
            ),
          },
        ]
      : []),
    {
      children: <VerifyPanel />,
      key: "verify",
      label: (
        <Space>
          <SafetyCertificateOutlined />
          Verify payload
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {!isBusinessOwner && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setCreateOpen(true)}
          >
            New recognition request
          </Button>
        </div>
      )}

      <Tabs items={tabItems} />

      {/* Create request modal */}
      <Modal
        confirmLoading={createMutation.isPending}
        open={createOpen}
        title="New cross-LGU recognition request"
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="Fire safety certificate number"
            name="certificateNumber"
            rules={[
              {
                message: "Certificate number is required",
                required: true,
              },
            ]}
          >
            <Input placeholder="e.g. FSIC-2024-00001" />
          </Form.Item>
        </Form>
        {createMutation.isError && (
          <Alert
            description={getApiErrorMessage(createMutation.error)}
            message="Failed to create request"
            showIcon
            type="error"
          />
        )}
      </Modal>
    </Space>
  );
}
