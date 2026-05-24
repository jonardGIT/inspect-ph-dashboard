"use client";

import {
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Badge,
  Card,
  Col,
  Divider,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";

import { useSystemHealth } from "@/hooks/use-system-health";

function formatUpdatedAt(value: number) {
  if (!value) {
    return "Waiting for the first health probe.";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function PublicStatusPage() {
  const healthQuery = useSystemHealth();
  const health = healthQuery.data;

  const apiStatus: "healthy" | "degraded" | "checking" =
    healthQuery.isLoading && !health
      ? "checking"
      : healthQuery.isError
        ? "degraded"
        : (health?.status ?? "checking");

  const dbStatus: "ok" | "error" | "checking" =
    healthQuery.isLoading && !health ? "checking" : (health?.db ?? "checking");

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Tag
            color={
              apiStatus === "healthy"
                ? "green"
                : apiStatus === "degraded"
                  ? "red"
                  : "blue"
            }
          >
            Inspect PH public service status
          </Tag>
          <Typography.Title level={1} style={{ margin: 0 }}>
            Platform status
          </Typography.Title>
          <Typography.Paragraph style={{ margin: 0, maxWidth: 760 }}>
            Live service availability for the Inspect PH API and database. This
            page refreshes automatically every 30 seconds and is safe to share
            with LGU stakeholders when they need a quick availability check.
          </Typography.Paragraph>
          <Typography.Text type="secondary">
            Last updated: {formatUpdatedAt(healthQuery.dataUpdatedAt)}
          </Typography.Text>
        </Space>
      </section>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card className="glass-card" title="Current service health">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <StatusRow
                healthyLabel="Healthy"
                checkingLabel="Checking"
                degradedLabel="Degraded"
                label="API"
                status={apiStatus}
              />
              <StatusRow
                healthyLabel="Connected"
                checkingLabel="Checking"
                degradedLabel="Disconnected"
                label="Database"
                status={
                  dbStatus === "ok"
                    ? "healthy"
                    : dbStatus === "error"
                      ? "degraded"
                      : "checking"
                }
              />
              {healthQuery.isError ? (
                <Alert
                  message="Live health data is temporarily unavailable."
                  description="The status probe could not reach the API. If this persists, treat the platform as degraded and contact the platform administrator."
                  showIcon
                  type="error"
                />
              ) : null}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card className="glass-card" title="Service commitments">
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Typography.Text strong>
                Published SLO / SLA targets
              </Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                API SLO 99.5% monthly uptime, dashboard SLO 99.0%, target API
                p95 latency below 500 ms for reads and 1,000 ms for writes, with
                RPO 1 hour and RTO 4 hours.
              </Typography.Paragraph>
              <Divider style={{ margin: 0 }} />
              <Typography.Text strong>Degraded-mode behavior</Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                When a dependency is impaired, Inspect PH should fail closed for
                unsafe writes, keep read-only views available when possible, and
                preserve pending mobile sync items until the network recovers.
              </Typography.Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </main>
  );
}

function StatusRow(input: {
  checkingLabel: string;
  degradedLabel: string;
  healthyLabel: string;
  label: string;
  status: "healthy" | "degraded" | "checking";
}) {
  return (
    <Space
      align="center"
      style={{ justifyContent: "space-between", width: "100%" }}
    >
      <Typography.Text strong>{input.label}</Typography.Text>
      {input.status === "healthy" ? (
        <Badge
          status="success"
          text={
            <Tag color="green" icon={<CheckCircleOutlined />}>
              {input.healthyLabel}
            </Tag>
          }
        />
      ) : input.status === "degraded" ? (
        <Badge
          status="error"
          text={
            <Tag color="red" icon={<WarningOutlined />}>
              {input.degradedLabel}
            </Tag>
          }
        />
      ) : (
        <Badge
          status="processing"
          text={<Tag icon={<SyncOutlined spin />}>{input.checkingLabel}</Tag>}
        />
      )}
    </Space>
  );
}
