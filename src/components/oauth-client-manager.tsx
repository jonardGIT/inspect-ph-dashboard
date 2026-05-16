"use client";

import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useState } from "react";

import type { OAuthClientRecord } from "@/types";
import { OAUTH_SCOPES } from "@/types";
import {
  useDeleteOAuthClient,
  useOAuthClients,
  useRegisterOAuthClient,
} from "@/hooks/use-oauth-clients";
import type { RegisterClientInput } from "@/lib/api/oauth";

const { Text } = Typography;

const SCOPE_LABELS: Record<string, string> = {
  "certificate:read": "Read fire safety certificates",
  "compliance:read": "Read compliance score",
  "permit:read": "Read permit records",
};

export function OAuthClientManager() {
  const { data: clients, isLoading } = useOAuthClients();
  const registerMutation = useRegisterOAuthClient();
  const deleteMutation = useDeleteOAuthClient();

  const [registerOpen, setRegisterOpen] = useState(false);
  const [secretModal, setSecretModal] = useState<{
    open: boolean;
    clientId: string;
    secret: string;
  }>({ clientId: "", open: false, secret: "" });

  const [form] = Form.useForm<RegisterClientInput>();

  const handleRegister = async () => {
    const values = await form.validateFields();
    const result = await registerMutation.mutateAsync(values);
    form.resetFields();
    setRegisterOpen(false);
    setSecretModal({
      clientId: result.data.clientId,
      open: true,
      secret: result.clientSecret,
    });
  };

  const handleDelete = (record: OAuthClientRecord) => {
    Modal.confirm({
      content: `This will immediately revoke all access tokens for "${record.name}".`,
      icon: <ExclamationCircleOutlined />,
      okButtonProps: { danger: true },
      okText: "Delete",
      onOk: () => deleteMutation.mutateAsync(record.id),
      title: "Delete OAuth client?",
    });
  };

  const columns = [
    {
      dataIndex: "name",
      key: "name",
      render: (name: string, r: OAuthClientRecord) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          {r.description && <Text type="secondary">{r.description}</Text>}
        </Space>
      ),
      title: "App name",
    },
    {
      dataIndex: "clientId",
      key: "clientId",
      render: (id: string) => <Text code>{id}</Text>,
      title: "Client ID",
    },
    {
      dataIndex: "scopes",
      key: "scopes",
      render: (scopes: string[]) => scopes.map((s) => <Tag key={s}>{s}</Tag>),
      title: "Scopes",
    },
    {
      dataIndex: "isActive",
      key: "isActive",
      render: (v: boolean) => (
        <Tag color={v ? "green" : "default"}>{v ? "Active" : "Inactive"}</Tag>
      ),
      title: "Status",
    },
    {
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => new Date(v).toLocaleDateString(),
      title: "Created",
    },
    {
      key: "actions",
      render: (_: unknown, record: OAuthClientRecord) => (
        <Tooltip title="Delete client">
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deleteMutation.isPending}
            size="small"
            onClick={() => handleDelete(record)}
          />
        </Tooltip>
      ),
      title: "",
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setRegisterOpen(true)}
        >
          Register new app
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={clients ?? []}
        loading={isLoading}
        rowKey="id"
      />

      {/* Register new client modal */}
      <Modal
        confirmLoading={registerMutation.isPending}
        open={registerOpen}
        title="Register OAuth2 application"
        onCancel={() => {
          form.resetFields();
          setRegisterOpen(false);
        }}
        onOk={handleRegister}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="App name"
            name="name"
            rules={[{ message: "Required", required: true }]}
          >
            <Input placeholder="My Partner App" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            label="Redirect URI"
            name="redirectUri"
            rules={[
              { message: "Required", required: true },
              {
                message: "Must start with https:// or http://localhost",
                pattern: /^(https:\/\/|http:\/\/localhost)/,
              },
            ]}
          >
            <Input placeholder="https://partner-app.example.com/callback" />
          </Form.Item>

          <Form.Item
            label="Scopes"
            name="scopes"
            rules={[{ message: "Select at least one scope", required: true }]}
          >
            <Checkbox.Group>
              <Space direction="vertical">
                {OAUTH_SCOPES.map((s) => (
                  <Checkbox key={s} value={s}>
                    <strong>{s}</strong>
                    {" — "}
                    {SCOPE_LABELS[s] ?? s}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* One-time secret display */}
      <Modal
        cancelButtonProps={{ style: { display: "none" } }}
        open={secretModal.open}
        title="OAuth2 client registered"
        onOk={() => setSecretModal((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          description="This is the only time the client secret will be shown. Copy it now and store it securely."
          message="Copy your client secret"
          showIcon
          type="warning"
        />

        <Space direction="vertical" style={{ marginTop: 16, width: "100%" }}>
          <Text>Client ID:</Text>
          <Input.Password
            readOnly
            addonAfter={
              <Tooltip title="Copy">
                <CopyOutlined
                  onClick={() =>
                    void navigator.clipboard.writeText(secretModal.clientId)
                  }
                />
              </Tooltip>
            }
            defaultValue={secretModal.clientId}
          />

          <Text>Client Secret:</Text>
          <Input.Password
            readOnly
            addonAfter={
              <Tooltip title="Copy">
                <CopyOutlined
                  onClick={() =>
                    void navigator.clipboard.writeText(secretModal.secret)
                  }
                />
              </Tooltip>
            }
            defaultValue={secretModal.secret}
          />
        </Space>
      </Modal>
    </>
  );
}
