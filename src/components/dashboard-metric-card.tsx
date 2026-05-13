"use client";

import { Card, Typography } from "antd";

interface DashboardMetricCardProps {
  accent?: boolean;
  description: string;
  label: string;
  value: React.ReactNode;
}

export default function DashboardMetricCard({
  accent = false,
  description,
  label,
  value,
}: DashboardMetricCardProps) {
  return (
    <Card
      className={`glass-card dashboard-metric-card${accent ? " dashboard-metric-card--accent" : ""}`}
    >
      <Typography.Text className="dashboard-metric-label">
        {label}
      </Typography.Text>
      <Typography.Title level={3} className="dashboard-metric-value">
        {value}
      </Typography.Title>
      <Typography.Text type="secondary">{description}</Typography.Text>
    </Card>
  );
}
