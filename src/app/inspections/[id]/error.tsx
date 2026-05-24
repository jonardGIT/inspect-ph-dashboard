"use client";

import { Alert, Button, Card, Space, Typography } from "antd";

interface InspectionDetailErrorProps {
  error: Error;
  reset: () => void;
}

export default function InspectionDetailError({
  error,
  reset,
}: InspectionDetailErrorProps) {
  return (
    <main className="page-shell">
      <Card className="glass-card dashboard-error-card">
        <Space orientation="vertical" size={16}>
          <Typography.Text className="dashboard-error-eyebrow">
            Workspace unavailable
          </Typography.Text>
          <Alert
            type="error"
            showIcon
            title="Failed to load inspection workspace"
            description={error.message}
          />
          <Button type="primary" onClick={reset}>
            Retry workspace
          </Button>
        </Space>
      </Card>
    </main>
  );
}
