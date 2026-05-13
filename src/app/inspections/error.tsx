"use client";

import { Alert, Button, Card, Space, Typography } from "antd";

interface InspectionsErrorProps {
  error: Error;
  reset: () => void;
}

export default function InspectionsError({
  error,
  reset,
}: InspectionsErrorProps) {
  return (
    <main className="page-shell">
      <Card className="glass-card dashboard-error-card">
        <Space direction="vertical" size={16}>
          <Typography.Text className="dashboard-error-eyebrow">
            Queue unavailable
          </Typography.Text>
          <Alert
            type="error"
            showIcon
            message="Failed to load inspections page"
            description={error.message}
          />
          <Button type="primary" onClick={reset}>
            Retry page
          </Button>
        </Space>
      </Card>
    </main>
  );
}
