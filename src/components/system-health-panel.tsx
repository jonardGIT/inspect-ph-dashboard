"use client";

import { Alert, Badge, Card, Col, Row, Space, Tag, Typography } from "antd";
import { CheckCircleOutlined, WarningOutlined } from "@ant-design/icons";

import DashboardMetricCard from "@/components/dashboard-metric-card";
import InspectionRouteShell from "@/components/inspection-route-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useInspectionBrowser } from "@/hooks/use-inspection-browser";
import { useSystemHealth } from "@/hooks/use-system-health";

export default function SystemHealthPanel() {
  const { accessToken } = useAuthSession();
  const healthQuery = useSystemHealth();
  const { summaryQuery } = useInspectionBrowser({ accessToken, page: 1 });

  const health = healthQuery.data;
  const summary = summaryQuery.data;

  const apiStatus: "healthy" | "degraded" | "unknown" =
    healthQuery.isError ? "degraded" : (health?.status ?? "unknown");
  const dbStatus = health?.db ?? "unknown";

  return (
    <InspectionRouteShell
      eyebrow="Platform operations"
      title="System health"
      description="Live status of the API, database, and inspection workload. Refreshes every 30 seconds."
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        <Card title="Service status" className="glass-card dashboard-data-card">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Space orientation="vertical" size={4}>
                <Typography.Text strong>API server</Typography.Text>
                {apiStatus === "healthy" ? (
                  <Badge
                    status="success"
                    text={
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        Healthy
                      </Tag>
                    }
                  />
                ) : apiStatus === "degraded" ? (
                  <Badge
                    status="error"
                    text={
                      <Tag color="red" icon={<WarningOutlined />}>
                        Degraded
                      </Tag>
                    }
                  />
                ) : (
                  <Badge status="processing" text={<Tag>Checking…</Tag>} />
                )}
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space orientation="vertical" size={4}>
                <Typography.Text strong>Database</Typography.Text>
                {dbStatus === "ok" ? (
                  <Badge
                    status="success"
                    text={
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        Connected
                      </Tag>
                    }
                  />
                ) : dbStatus === "error" ? (
                  <Badge
                    status="error"
                    text={
                      <Tag color="red" icon={<WarningOutlined />}>
                        Disconnected
                      </Tag>
                    }
                  />
                ) : (
                  <Badge status="processing" text={<Tag>Checking…</Tag>} />
                )}
              </Space>
            </Col>
          </Row>
          {healthQuery.isError ? (
            <Alert
              type="error"
              showIcon
              title="Could not reach the API server. Check that the API service is running."
              style={{ marginTop: 16 }}
            />
          ) : null}
        </Card>

        <Card
          title="Inspection workload snapshot"
          className="glass-card dashboard-data-card"
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} xl={4}>
              <DashboardMetricCard
                label="Total"
                value={summary?.total ?? "--"}
                description="All inspections"
              />
            </Col>
            <Col xs={12} sm={8} xl={4}>
              <DashboardMetricCard
                label="Scheduled"
                value={summary?.scheduled ?? "--"}
                description="Awaiting field visit"
              />
            </Col>
            <Col xs={12} sm={8} xl={4}>
              <DashboardMetricCard
                label="In progress"
                value={summary?.inProgress ?? "--"}
                description="Currently active"
              />
            </Col>
            <Col xs={12} sm={8} xl={4}>
              <DashboardMetricCard
                label="Completed"
                value={summary?.completed ?? "--"}
                description="Finished this period"
              />
            </Col>
            <Col xs={12} sm={8} xl={4}>
              <DashboardMetricCard
                accent
                label="Overdue"
                value={summary?.overdue ?? "--"}
                description="Needs supervisory action"
              />
            </Col>
            <Col xs={12} sm={8} xl={4}>
              <DashboardMetricCard
                label="Canceled"
                value={summary?.canceled ?? "--"}
                description="Canceled this period"
              />
            </Col>
          </Row>
        </Card>
      </Space>
    </InspectionRouteShell>
  );
}
