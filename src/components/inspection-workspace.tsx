"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Image,
  List,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  Timeline,
  Typography,
} from "antd";
import type { InspectionHistoryEvent } from "@shared/types/api";

import { useInspectionWorkspace } from "@/hooks/use-inspection-workspace";
import { useInspectionLookups } from "@/hooks/use-inspection-lookups";
import { hasPermission } from "@/components/dashboard-app-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getApiErrorMessage } from "@/lib/api/http";
import InspectionRouteShell from "@/components/inspection-route-shell";

const inspectionStatusColors: Record<string, string> = {
  canceled: "default",
  completed: "green",
  in_progress: "gold",
  overdue: "red",
  scheduled: "blue",
};

const findingSeverityColors: Record<string, string> = {
  critical: "red",
  high: "volcano",
  low: "green",
  medium: "gold",
};

function formatDate(value?: string) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function createMapLink(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

interface InspectionWorkspaceProps {
  inspectionId: string;
}

interface AttachmentPreviewState {
  fileName: string;
  mimeType: string;
  url: string;
}

function canPreviewAttachment(mimeType: string) {
  return mimeType.startsWith("image/") || mimeType === "application/pdf";
}

const historyEventColors: Record<InspectionHistoryEvent["type"], string> = {
  attachment_uploaded: "gray",
  checklist_result_recorded: "blue",
  finding_logged: "red",
  finding_resolved: "green",
  inspection_completed: "green",
  inspection_created: "blue",
  inspection_started: "gold",
};

export default function InspectionWorkspace({
  inspectionId,
}: InspectionWorkspaceProps) {
  const [assignmentForm] = Form.useForm();
  const [inspectorLookupSearch, setInspectorLookupSearch] = useState("");
  const [preview, setPreview] = useState<AttachmentPreviewState | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { accessToken, session } = useAuthSession();
  const isAdmin = hasPermission(session, "inspection:assign");
  const { inspectorsQuery } = useInspectionLookups({
    accessToken,
    canListInspectors: isAdmin,
    inspectorSearch: inspectorLookupSearch,
  });

  const {
    assignInspectionMutation,
    attachmentsQuery,
    checklistQuery,
    createAttachmentDownloadIntentMutation,
    findingsQuery,
    historyQuery,
    inspectionQuery,
    uploadAttachmentMutation,
  } = useInspectionWorkspace(inspectionId, accessToken);

  const uploadSelectedFile = async () => {
    if (!selectedFile) {
      return;
    }

    await uploadAttachmentMutation.mutateAsync(selectedFile);
    setSelectedFile(null);
  };

  const openAttachment = async (attachmentId: string) => {
    const intent =
      await createAttachmentDownloadIntentMutation.mutateAsync(attachmentId);

    if (!intent.downloadUrl) {
      throw new Error("Attachment download URL is missing");
    }

    window.open(intent.downloadUrl, "_blank", "noopener,noreferrer");
  };

  const inspection = inspectionQuery.data;
  const inspectorOptions = (inspectorsQuery.data?.data ?? []).map((user) => ({
    label: `${user.name} · ${user.email}`,
    value: user.id,
  }));
  const activityItems = historyQuery.data ?? [];
  const isWorkspaceLoading =
    inspectionQuery.isLoading ||
    checklistQuery.isLoading ||
    findingsQuery.isLoading ||
    historyQuery.isLoading ||
    attachmentsQuery.isLoading;
  const workspaceError =
    inspectionQuery.error ||
    checklistQuery.error ||
    findingsQuery.error ||
    historyQuery.error ||
    attachmentsQuery.error;

  const assignInspectionToInspector = async () => {
    const values = await assignmentForm.validateFields();

    await assignInspectionMutation.mutateAsync(values.inspectorId);
    assignmentForm.resetFields();
  };

  const previewAttachment = async (attachmentId: string) => {
    const attachment = attachmentsQuery.data?.find(
      (item) => item.id === attachmentId,
    );

    if (!attachment) {
      return;
    }

    const intent =
      await createAttachmentDownloadIntentMutation.mutateAsync(attachmentId);

    if (!intent.downloadUrl) {
      throw new Error("Attachment download URL is missing");
    }

    setPreview({
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      url: intent.downloadUrl,
    });
  };

  return (
    <InspectionRouteShell
      eyebrow="BPLO inspection workspace"
      title={`Inspection ${inspectionId}`}
      description="Load an inspection record, review checklist and findings, and upload evidence through the provider-aware attachment flow."
      secondarySidebar={
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          {hasPermission(session, "inspection:assign") ? (
            <Card title="Assignment" className="glass-card dashboard-side-card">
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Typography.Paragraph style={{ margin: 0 }}>
                  Assign or reassign this inspection using the inspector
                  directory.
                </Typography.Paragraph>
                <Form form={assignmentForm} layout="vertical">
                  <Form.Item
                    label="Inspector"
                    name="inspectorId"
                    rules={[{ required: true }]}
                  >
                    <Select
                      showSearch
                      filterOption={false}
                      placeholder="Select inspector"
                      options={inspectorOptions}
                      loading={inspectorsQuery.isLoading}
                      onSearch={setInspectorLookupSearch}
                    />
                  </Form.Item>
                </Form>
                <Button
                  type="primary"
                  loading={assignInspectionMutation.isPending}
                  onClick={assignInspectionToInspector}
                >
                  Save assignment
                </Button>
                {assignInspectionMutation.error ? (
                  <Alert
                    type="error"
                    showIcon
                    message={getApiErrorMessage(assignInspectionMutation.error)}
                  />
                ) : null}
              </Space>
            </Card>
          ) : null}

          <Card
            title="Attachment upload"
            className="glass-card dashboard-side-card"
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Typography.Paragraph style={{ margin: 0 }}>
                This uploads the binary first using the new upload intent, then
                creates the attachment metadata record against the inspection.
              </Typography.Paragraph>
              <input
                type="file"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] || null)
                }
              />
              <Button
                type="primary"
                disabled={!selectedFile || !accessToken}
                loading={uploadAttachmentMutation.isPending}
                onClick={uploadSelectedFile}
              >
                Upload selected file
              </Button>
              {selectedFile ? (
                <Typography.Text type="secondary">
                  Ready: {selectedFile.name} ({formatBytes(selectedFile.size)})
                </Typography.Text>
              ) : null}
              {uploadAttachmentMutation.error ? (
                <Alert
                  type="error"
                  showIcon
                  message={getApiErrorMessage(uploadAttachmentMutation.error)}
                />
              ) : null}
              {createAttachmentDownloadIntentMutation.error ? (
                <Alert
                  type="error"
                  showIcon
                  message={getApiErrorMessage(
                    createAttachmentDownloadIntentMutation.error,
                  )}
                />
              ) : null}
            </Space>
          </Card>
        </Space>
      }
    >
      {workspaceError ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          message={getApiErrorMessage(workspaceError)}
        />
      ) : null}

      {isWorkspaceLoading ? (
        <Card className="glass-card">
          <Spin size="large" />
        </Card>
      ) : null}

      {inspection ? (
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Row gutter={[16, 16]} className="dashboard-summary-row">
            <Col xs={24} md={8}>
              <Card className="glass-card dashboard-metric-card dashboard-metric-card--accent">
                <Typography.Text className="dashboard-metric-label">
                  Checklist items
                </Typography.Text>
                <Typography.Title level={3} className="dashboard-metric-value">
                  {checklistQuery.data?.length ?? 0}
                </Typography.Title>
                <Typography.Text type="secondary">
                  Recorded compliance checks
                </Typography.Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="glass-card dashboard-metric-card">
                <Typography.Text className="dashboard-metric-label">
                  Findings logged
                </Typography.Text>
                <Typography.Title level={3} className="dashboard-metric-value">
                  {findingsQuery.data?.length ?? 0}
                </Typography.Title>
                <Typography.Text type="secondary">
                  Active field observations
                </Typography.Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="glass-card dashboard-metric-card">
                <Typography.Text className="dashboard-metric-label">
                  Attachments stored
                </Typography.Text>
                <Typography.Title level={3} className="dashboard-metric-value">
                  {attachmentsQuery.data?.length ?? 0}
                </Typography.Title>
                <Typography.Text type="secondary">
                  Evidence files available
                </Typography.Text>
              </Card>
            </Col>
          </Row>

          <Card className="glass-card">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Statistic
                  title="Business"
                  value={inspection.business.businessName}
                />
              </Col>
              <Col xs={24} md={8}>
                <Statistic
                  title="Permit"
                  value={inspection.permit.permitNumber}
                />
              </Col>
              <Col xs={24} md={8}>
                <Space direction="vertical" size={4}>
                  <Typography.Text type="secondary">Status</Typography.Text>
                  <Tag
                    color={
                      inspectionStatusColors[inspection.status] || "default"
                    }
                  >
                    {inspection.status.replace("_", " ")}
                  </Tag>
                </Space>
              </Col>
            </Row>
            <Descriptions column={1} style={{ marginTop: 20 }}>
              <Descriptions.Item label="Scheduled at">
                {formatDate(inspection.scheduledAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Started at">
                {formatDate(inspection.startedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Completed at">
                {formatDate(inspection.completedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Notes">
                {inspection.notes || "No notes captured"}
              </Descriptions.Item>
              <Descriptions.Item label="Inspector ID">
                {inspection.inspectorId || "Unassigned"}
              </Descriptions.Item>
              <Descriptions.Item label="Inspection location">
                {inspection.location ? (
                  <Space direction="vertical" size={0}>
                    <Typography.Text>
                      {inspection.location.latitude.toFixed(5)},{" "}
                      {inspection.location.longitude.toFixed(5)}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      Accuracy {inspection.location.accuracyMeters ?? "n/a"}{" "}
                      meters
                    </Typography.Text>
                    <Typography.Link
                      href={createMapLink(
                        inspection.location.latitude,
                        inspection.location.longitude,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open inspection map
                    </Typography.Link>
                  </Space>
                ) : (
                  "No location captured"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title="Inspection activity"
            className="glass-card dashboard-data-card"
          >
            {activityItems.length ? (
              <Timeline
                items={activityItems.map((item) => ({
                  content: (
                    <Space direction="vertical" size={0}>
                      <Typography.Text>{item.title}</Typography.Text>
                      {item.detail ? (
                        <Typography.Text type="secondary">
                          {item.detail}
                        </Typography.Text>
                      ) : null}
                      <Typography.Text type="secondary">
                        {formatDate(item.occurredAt)}
                      </Typography.Text>
                    </Space>
                  ),
                  color: historyEventColors[item.type],
                }))}
              />
            ) : (
              <Empty description="Activity appears here once inspection events exist" />
            )}
          </Card>

          <Row gutter={[20, 20]}>
            <Col xs={24} lg={12}>
              <Card
                title="Checklist results"
                className="glass-card dashboard-data-card"
              >
                {checklistQuery.data?.length ? (
                  <List
                    dataSource={checklistQuery.data}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={`${item.template.code} · ${item.template.title}`}
                          description={item.remarks || "No remarks"}
                        />
                        <Tag>{item.status.replace("_", " ")}</Tag>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No checklist results yet" />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Findings" className="glass-card dashboard-data-card">
                {findingsQuery.data?.length ? (
                  <List
                    dataSource={findingsQuery.data}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.title}
                          description={item.description}
                        />
                        <Tag
                          color={
                            findingSeverityColors[item.severity] || "default"
                          }
                        >
                          {item.severity}
                        </Tag>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No findings recorded" />
                )}
              </Card>
            </Col>
          </Row>

          <Card title="Attachments" className="glass-card dashboard-data-card">
            {attachmentsQuery.data?.length ? (
              <List
                dataSource={attachmentsQuery.data}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.fileName}
                      description={`${item.mimeType} · ${formatBytes(item.fileSizeBytes)}`}
                    />
                    <Space>
                      <Typography.Text type="secondary">
                        {formatDate(item.createdAt)}
                      </Typography.Text>
                      {canPreviewAttachment(item.mimeType) ? (
                        <Button
                          onClick={() => void previewAttachment(item.id)}
                          loading={
                            createAttachmentDownloadIntentMutation.isPending &&
                            createAttachmentDownloadIntentMutation.variables ===
                              item.id
                          }
                        >
                          Preview
                        </Button>
                      ) : null}
                      <Button
                        onClick={() => void openAttachment(item.id)}
                        loading={
                          createAttachmentDownloadIntentMutation.isPending &&
                          createAttachmentDownloadIntentMutation.variables ===
                            item.id
                        }
                      >
                        Open file
                      </Button>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No attachments uploaded" />
            )}
          </Card>

          <Modal
            open={Boolean(preview)}
            title={preview?.fileName || "Attachment preview"}
            footer={null}
            onCancel={() => setPreview(null)}
            width={preview?.mimeType === "application/pdf" ? 960 : 720}
          >
            {preview?.mimeType.startsWith("image/") ? (
              <Image
                alt={preview.fileName}
                preview={false}
                src={preview.url}
                style={{ maxHeight: "70vh", objectFit: "contain" }}
                width="100%"
              />
            ) : preview?.mimeType === "application/pdf" ? (
              <iframe
                src={preview.url}
                title={preview.fileName}
                style={{ border: 0, height: "70vh", width: "100%" }}
              />
            ) : null}
          </Modal>
        </Space>
      ) : !isWorkspaceLoading && accessToken ? (
        <Card className="glass-card">
          <Empty description="Inspection data will appear here once the query succeeds" />
        </Card>
      ) : null}
    </InspectionRouteShell>
  );
}
