"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { getApiErrorMessage } from "@/lib/api/http";
import {
  useCreateWebhookEndpoint,
  useDeleteWebhookEndpoint,
  useWebhookEndpoints,
} from "@/hooks/use-webhook-endpoints";
import type { OutboundWebhookEvent, WebhookEndpoint } from "@shared/types/api";

const { Title, Text } = Typography;

const ALLOWED_EVENTS: { label: string; value: OutboundWebhookEvent }[] = [
  { label: "Inspection completed", value: "inspection.completed" },
  { label: "Finding raised", value: "finding.raised" },
  { label: "Certificate issued", value: "certificate.issued" },
  { label: "Payment received", value: "payment.received" },
];

const EVENT_COLORS: Record<OutboundWebhookEvent, string> = {
  "inspection.completed": "green",
  "finding.raised": "orange",
  "certificate.issued": "blue",
  "payment.received": "purple",
};

export function WebhookEndpointManager() {
  const { data: endpoints, isLoading, error } = useWebhookEndpoints();
  const createMutation = useCreateWebhookEndpoint();
  const deleteMutation = useDeleteWebhookEndpoint();

  const [showAddModal, setShowAddModal] = useState(false);
  const [form] = Form.useForm<{
    url: string;
    secret: string;
    events: OutboundWebhookEvent[];
  }>();

  function handleAddSubmit() {
    form.validateFields().then((values) => {
      createMutation.mutate(values, {
        onSuccess: () => {
          form.resetFields();
          setShowAddModal(false);
        },
      });
    });
  }

  function confirmDelete(id: string, url: string) {
    Modal.confirm({
      title: "Remove webhook endpoint?",
      content: (
        <span>
          This will permanently remove <Text code>{url}</Text> and stop all
          future deliveries. Past delivery records are retained.
        </span>
      ),
      okText: "Remove",
      okType: "danger",
      onOk: () => deleteMutation.mutate(id),
    });
  }

  const columns: ColumnsType<WebhookEndpoint> = [
    {
      dataIndex: "url",
      key: "url",
      title: "URL",
      ellipsis: true,
      render: (url: string) => (
        <Tooltip title={url}>
          <Text code style={{ fontSize: 12 }}>
            {url}
          </Text>
        </Tooltip>
      ),
    },
    {
      dataIndex: "events",
      key: "events",
      title: "Subscribed events",
      render: (events: OutboundWebhookEvent[]) => (
        <Space wrap size={4}>
          {events.map((e) => (
            <Tag key={e} color={EVENT_COLORS[e]} style={{ margin: 0 }}>
              {e}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      dataIndex: "isActive",
      key: "isActive",
      title: "Active",
      width: 80,
      align: "center",
      render: (active: boolean) => <Checkbox checked={active} disabled />,
    },
    {
      dataIndex: "createdAt",
      key: "createdAt",
      title: "Registered",
      width: 160,
      render: (createdAt: string) =>
        dayjs(createdAt).format("YYYY-MM-DD HH:mm"),
    },
    {
      key: "actions",
      title: "",
      width: 60,
      align: "center",
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          loading={deleteMutation.isPending}
          onClick={() => confirmDelete(record.id, record.url)}
          size="small"
          type="text"
        />
      ),
    },
  ];

  if (error) {
    return <Alert message={getApiErrorMessage(error)} type="error" showIcon />;
  }

  return (
    <div>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Webhook endpoints
        </Title>
        <Button
          icon={<PlusOutlined />}
          onClick={() => setShowAddModal(true)}
          type="primary"
        >
          Add endpoint
        </Button>
      </div>

      <Alert
        message="Outbound webhooks"
        description="InspectPH will POST signed JSON payloads to your endpoints when the subscribed events occur. Each request includes an X-InspectPH-Signature header for HMAC-SHA256 verification using your secret."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {isLoading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={endpoints ?? []}
          pagination={false}
          rowKey="id"
          size="small"
        />
      )}

      <Modal
        confirmLoading={createMutation.isPending}
        onCancel={() => {
          form.resetFields();
          setShowAddModal(false);
        }}
        onOk={handleAddSubmit}
        open={showAddModal}
        title="Add webhook endpoint"
        width={520}
      >
        {createMutation.isError && (
          <Alert
            message={getApiErrorMessage(createMutation.error)}
            type="error"
            showIcon
            style={{ marginBottom: 12 }}
          />
        )}
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            label="HTTPS URL"
            name="url"
            rules={[
              { required: true, message: "URL is required" },
              {
                type: "url",
                message: "Must be a valid URL",
              },
            ]}
          >
            <Input placeholder="https://your-system.example.com/hooks/inspectph" />
          </Form.Item>
          <Form.Item
            label="Signing secret"
            name="secret"
            extra="Minimum 16 characters. Store this securely — it will not be shown again."
            rules={[
              { required: true, message: "Secret is required" },
              { min: 16, message: "Secret must be at least 16 characters" },
            ]}
          >
            <Input.Password placeholder="A strong random string" />
          </Form.Item>
          <Form.Item
            label="Events to subscribe"
            name="events"
            rules={[{ required: true, message: "Select at least one event" }]}
          >
            <Select
              mode="multiple"
              options={ALLOWED_EVENTS}
              placeholder="Select events"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
