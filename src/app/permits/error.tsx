"use client";

import { Alert, Button, Card, Space, Typography } from "antd";

interface PermitsErrorProps {
  error: Error;
  reset: () => void;
}

export default function PermitsError({ error, reset }: PermitsErrorProps) {
  return (
    <main className="page-shell">
      <Card className="glass-card dashboard-error-card">
        <Space direction="vertical" size={16}>
          <Typography.Text className="dashboard-error-eyebrow">
            Permit workflow paused
          </Typography.Text>
          <Alert
            type="error"
            showIcon
            message="Failed to load permits page"
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
