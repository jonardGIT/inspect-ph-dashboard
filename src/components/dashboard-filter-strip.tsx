"use client";

import { Button, Card, Space, Typography } from "antd";

interface DashboardFilterStripProps {
  children: React.ReactNode;
  clearLabel?: string;
  label?: string;
  onClear?: () => void;
}

export default function DashboardFilterStrip({
  children,
  clearLabel = "Clear filters",
  label = "Active filters",
  onClear,
}: DashboardFilterStripProps) {
  return (
    <Card className="glass-card dashboard-filter-strip">
      <Space size={[8, 8]} wrap>
        <Typography.Text className="dashboard-filter-strip-label">
          {label}
        </Typography.Text>
        {children}
        {onClear ? (
          <Button size="small" onClick={onClear}>
            {clearLabel}
          </Button>
        ) : null}
      </Space>
    </Card>
  );
}
