"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import type { FindingDisputeRecord } from "@shared/types/api";

import { useFindingDispute } from "@/hooks/use-finding-dispute";
import { useAuthSession } from "@/hooks/use-auth-session";
import { hasPermission } from "@/components/dashboard-app-shell";
import { getApiErrorMessage } from "@/lib/api/http";

const disputeStatusColors: Record<
  FindingDisputeRecord["status"],
  "warning" | "processing" | "success" | "error"
> = {
  pending: "warning",
  reviewing: "processing",
  upheld: "success",
  overturned: "error",
};

interface FindingDisputePanelProps {
  findingId: string;
  findingTitle: string;
}

export default function FindingDisputePanel({
  findingId,
  findingTitle,
}: FindingDisputePanelProps) {
  const { session } = useAuthSession();
  const isBusinessOwner = session?.user.role === "business_owner";
  const isAdmin = hasPermission(session, "inspection:assign");
  const [modalOpen, setModalOpen] = useState(false);
  const [resolveForm] = Form.useForm<{
    status: "REVIEWING" | "UPHELD" | "OVERTURNED";
    resolution?: string;
  }>();
  const [submitReason, setSubmitReason] = useState("");

  const { data, error, isLoading, resolveMutation, submitMutation } =
    useFindingDispute(findingId);

  const handleSubmit = async () => {
    if (!submitReason.trim()) return;
    await submitMutation.mutateAsync(submitReason);
    setSubmitReason("");
    setModalOpen(false);
  };

  const handleResolve = async () => {
    const values = await resolveForm.validateFields();
    await resolveMutation.mutateAsync({
      resolution: values.resolution,
      status: values.status,
    });
    resolveForm.resetFields();
    setModalOpen(false);
  };

  // Don't render if loading and no prior data, and user can't do anything
  if (!isBusinessOwner && !isAdmin) return null;

  const hasDispute = !!data;
  const isResolved = data?.status === "upheld" || data?.status === "overturned";

  return (
    <>
      {hasDispute && (
        <Badge
          status={disputeStatusColors[data.status]}
          text={
            <Typography.Text style={{ fontSize: 12 }}>
              Dispute: {data.status}
            </Typography.Text>
          }
          style={{ display: "block", marginTop: 4 }}
        />
      )}
      <Button
        size="small"
        icon={<ExclamationCircleOutlined />}
        onClick={() => setModalOpen(true)}
        style={{ marginTop: 6 }}
        disabled={isLoading}
      >
        {hasDispute ? "View dispute" : "Dispute finding"}
      </Button>

      <Modal
        open={modalOpen}
        title={`Finding dispute — ${findingTitle}`}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {error && !hasDispute && (
            <Typography.Text type="secondary">
              No dispute has been filed for this finding.
            </Typography.Text>
          )}

          {hasDispute && (
            <>
              <div>
                <Tag color={disputeStatusColors[data.status]}>
                  {data.status.toUpperCase()}
                </Tag>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Filed by {data.disputedBy.name} ·{" "}
                  {new Date(data.createdAt).toLocaleDateString("en-PH")}
                </Typography.Text>
              </div>
              <div>
                <Typography.Text strong>Reason</Typography.Text>
                <Typography.Paragraph style={{ margin: "4px 0 0" }}>
                  {data.reason}
                </Typography.Paragraph>
              </div>
              {data.resolution && (
                <div>
                  <Typography.Text strong>Resolution</Typography.Text>
                  <Typography.Paragraph style={{ margin: "4px 0 0" }}>
                    {data.resolution}
                  </Typography.Paragraph>
                  {data.resolvedBy && (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Resolved by {data.resolvedBy.name} ·{" "}
                      {data.resolvedAt
                        ? new Date(data.resolvedAt).toLocaleDateString("en-PH")
                        : ""}
                    </Typography.Text>
                  )}
                </div>
              )}
            </>
          )}

          {isAdmin && hasDispute && !isResolved && (
            <>
              <Typography.Text strong>Update dispute status</Typography.Text>
              <Form form={resolveForm} layout="vertical">
                <Form.Item
                  name="status"
                  label="New status"
                  rules={[{ required: true, message: "Select a status" }]}
                >
                  <Select
                    options={[
                      { label: "Reviewing", value: "REVIEWING" },
                      { label: "Upheld (finding stands)", value: "UPHELD" },
                      {
                        label: "Overturned (finding retracted)",
                        value: "OVERTURNED",
                      },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="resolution" label="Resolution note (optional)">
                  <Input.TextArea rows={3} maxLength={2000} showCount />
                </Form.Item>
              </Form>
              {resolveMutation.error && (
                <Alert
                  type="error"
                  showIcon
                  message={getApiErrorMessage(resolveMutation.error)}
                />
              )}
              <Button
                type="primary"
                loading={resolveMutation.isPending}
                onClick={handleResolve}
              >
                Submit resolution
              </Button>
            </>
          )}

          {isBusinessOwner && !hasDispute && (
            <>
              <Typography.Text strong>
                Submit a dispute for this finding
              </Typography.Text>
              <Typography.Text type="secondary">
                Provide a clear reason why you believe this finding is
                inaccurate or should be reviewed.
              </Typography.Text>
              <Input.TextArea
                rows={4}
                maxLength={2000}
                showCount
                placeholder="Describe the basis for your dispute…"
                value={submitReason}
                onChange={(e) => setSubmitReason(e.target.value)}
              />
              {submitMutation.error && (
                <Alert
                  type="error"
                  showIcon
                  message={getApiErrorMessage(submitMutation.error)}
                />
              )}
              <Button
                type="primary"
                loading={submitMutation.isPending}
                disabled={!submitReason.trim()}
                onClick={handleSubmit}
              >
                Submit dispute
              </Button>
            </>
          )}
        </Space>
      </Modal>
    </>
  );
}
