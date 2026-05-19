"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import type {
  BusinessNameMatch,
  DisasterAlert,
  NationalVerificationHistoryItem,
} from "@/types";
import {
  useDisasterAlerts,
  useLookupBusinessName,
  useVerificationHistory,
  useVerifyBirTin,
  useVerifyPhilSysPcn,
} from "@/hooks/use-national-integrations";
import { getApiErrorMessage } from "@/lib/api/http";

const { Text, Title } = Typography;

const SEVERITY_COLOR: Record<string, string> = {
  ADVISORY: "blue",
  SIGNAL_1: "gold",
  SIGNAL_2: "orange",
  SIGNAL_3: "red",
  SIGNAL_4: "volcano",
  SIGNAL_5: "magenta",
  WARNING: "orange",
  WATCH: "gold",
};

// ---------------------------------------------------------------------------
// PhilSys PCN card
// ---------------------------------------------------------------------------

function PhilSysPanel() {
  const [form] = Form.useForm<{ assertedName: string; pcn: string }>();
  const mutation = useVerifyPhilSysPcn();

  return (
    <Card size="small" title="PhilSys PCN verification">
      <Form form={form} layout="vertical" onFinish={mutation.mutate}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label="PCN (12 digits)"
              name="pcn"
              rules={[{ len: 12, message: "PCN must be 12 digits", required: true }]}
            >
              <Input maxLength={12} placeholder="000000000000" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Asserted full name"
              name="assertedName"
              rules={[{ required: true }]}
            >
              <Input placeholder="Juan Dela Cruz" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button
            htmlType="submit"
            loading={mutation.isPending}
            type="primary"
          >
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
        <Space>
          {mutation.data.verified ? (
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
          ) : (
            <CloseCircleOutlined style={{ color: "#f5222d" }} />
          )}
          <Text>
            PCN <Text code>{mutation.data.pcn}</Text> —{" "}
            {mutation.data.verified ? "valid format" : "invalid format"}{" "}
            (provider: {mutation.data.providerSource})
          </Text>
        </Space>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// BIR TIN card
// ---------------------------------------------------------------------------

function TinPanel() {
  const [form] = Form.useForm<{
    assertedBusinessName: string;
    tin: string;
  }>();
  const mutation = useVerifyBirTin();

  return (
    <Card size="small" title="BIR TIN verification">
      <Form form={form} layout="vertical" onFinish={mutation.mutate}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label="TIN"
              name="tin"
              rules={[{ message: "TIN is required", required: true }]}
            >
              <Input placeholder="000-000-000 or 000-000-000-00000" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Asserted business name"
              name="assertedBusinessName"
              rules={[{ required: true }]}
            >
              <Input placeholder="ACME Trading" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button
            htmlType="submit"
            loading={mutation.isPending}
            type="primary"
          >
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
        <Space>
          {mutation.data.verified ? (
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
          ) : (
            <CloseCircleOutlined style={{ color: "#f5222d" }} />
          )}
          <Text>
            TIN <Text code>{mutation.data.normalizedTin}</Text> —{" "}
            {mutation.data.verified ? "valid format" : "invalid format"}{" "}
            (provider: {mutation.data.providerSource})
          </Text>
        </Space>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// DTI/SEC business name lookup card
// ---------------------------------------------------------------------------

function BusinessLookupPanel() {
  const [form] = Form.useForm<{ q: string; type: "ALL" | "DTI" | "SEC" }>();
  const mutation = useLookupBusinessName();

  return (
    <Card size="small" title="DTI / SEC business name lookup">
      <Form
        form={form}
        initialValues={{ type: "ALL" }}
        layout="inline"
        onFinish={mutation.mutate}
      >
        <Form.Item name="q" rules={[{ min: 2, required: true }]}>
          <Input placeholder="Business name" style={{ width: 240 }} />
        </Form.Item>
        <Form.Item name="type">
          <Select style={{ width: 100 }}>
            <Select.Option value="ALL">All</Select.Option>
            <Select.Option value="DTI">DTI</Select.Option>
            <Select.Option value="SEC">SEC</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button
            htmlType="submit"
            icon={<SearchOutlined />}
            loading={mutation.isPending}
          >
            Search
          </Button>
        </Form.Item>
      </Form>

      {mutation.isError && (
        <Alert
          description={getApiErrorMessage(mutation.error)}
          message="Lookup failed"
          showIcon
          style={{ marginTop: 12 }}
          type="error"
        />
      )}

      {mutation.isSuccess && (
        <Table<BusinessNameMatch>
          columns={[
            { dataIndex: "name", key: "name", title: "Name" },
            { dataIndex: "type", key: "type", title: "Registry" },
            {
              dataIndex: "status",
              key: "status",
              render: (s: string) => (
                <Tag color={s === "ACTIVE" ? "success" : "default"}>{s}</Tag>
              ),
              title: "Status",
            },
            { dataIndex: "owner", key: "owner", title: "Owner" },
            {
              dataIndex: "registrationNumber",
              key: "registrationNumber",
              title: "Reg. #",
            },
          ]}
          dataSource={mutation.data}
          pagination={false}
          rowKey="registrationNumber"
          size="small"
          style={{ marginTop: 12 }}
        />
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Disaster alerts card
// ---------------------------------------------------------------------------

function DisasterAlertsPanel() {
  const { data: alerts, isLoading } = useDisasterAlerts();

  return (
    <Card
      extra={
        <Badge
          count={alerts?.length ?? 0}
          showZero
          style={{ backgroundColor: (alerts?.length ?? 0) > 0 ? "#f5222d" : "#ccc" }}
        />
      }
      size="small"
      title={
        <Space>
          <WarningOutlined />
          PAGASA / PHIVOLCS / NDRRMC alerts
        </Space>
      }
    >
      <Table<DisasterAlert>
        columns={[
          {
            dataIndex: "type",
            key: "type",
            render: (t: string) => <Tag>{t}</Tag>,
            title: "Type",
            width: 100,
          },
          {
            dataIndex: "severity",
            key: "severity",
            render: (s: string) => (
              <Tag color={SEVERITY_COLOR[s] ?? "default"}>{s}</Tag>
            ),
            title: "Severity",
            width: 110,
          },
          { dataIndex: "title", key: "title", title: "Title" },
          { dataIndex: "source", key: "source", title: "Source", width: 90 },
          {
            dataIndex: "issuedAt",
            key: "issuedAt",
            render: (v: string) => new Date(v).toLocaleString(),
            title: "Issued",
            width: 160,
          },
        ]}
        dataSource={alerts ?? []}
        loading={isLoading}
        locale={{ emptyText: "No active alerts" }}
        pagination={false}
        rowKey="id"
        size="small"
      />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Verification history card
// ---------------------------------------------------------------------------

function VerificationHistoryPanel() {
  const { data, isLoading } = useVerificationHistory({ limit: 20, page: 1 });

  return (
    <Card size="small" title="Verification history">
      <Table<NationalVerificationHistoryItem>
        columns={[
          { dataIndex: "kind", key: "kind", title: "Kind", width: 120 },
          {
            dataIndex: "referenceValue",
            key: "referenceValue",
            render: (v: string) => <Text code>{v}</Text>,
            title: "Reference",
          },
          {
            dataIndex: "verified",
            key: "verified",
            render: (v: boolean) =>
              v ? (
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
              ) : (
                <CloseCircleOutlined style={{ color: "#f5222d" }} />
              ),
            title: "Verified",
            width: 80,
          },
          {
            dataIndex: "providerSource",
            key: "providerSource",
            title: "Provider",
            width: 90,
          },
          {
            dataIndex: "createdAt",
            key: "createdAt",
            render: (v: string) => new Date(v).toLocaleDateString(),
            title: "Date",
            width: 110,
          },
        ]}
        dataSource={data?.data ?? []}
        loading={isLoading}
        pagination={false}
        rowKey="id"
        size="small"
      />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function NationalIntegrationsPanel() {
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Title level={5} style={{ margin: 0 }}>
        Government registry verifications
      </Title>
      <Alert
        description="Format validation runs locally. Full identity matching requires a Data Sharing Agreement (DSA) with the respective agency. Contact your LGU's ICT officer to provision live API credentials."
        message="Stub mode active"
        showIcon
        type="info"
      />
      <Row gutter={[16, 16]}>
        <Col span={24} xl={12}>
          <PhilSysPanel />
        </Col>
        <Col span={24} xl={12}>
          <TinPanel />
        </Col>
      </Row>
      <BusinessLookupPanel />
      <DisasterAlertsPanel />
      <VerificationHistoryPanel />
    </Space>
  );
}
