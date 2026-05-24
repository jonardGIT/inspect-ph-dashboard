"use client";

import { Alert, Button, Card, Space, Typography } from "antd";

interface BusinessesErrorProps {
  error: Error;
  reset: () => void;
}

export default function BusinessesError({
  error,
  reset,
}: BusinessesErrorProps) {
  return (
    <main className="page-shell">
      <Card className="glass-card dashboard-error-card">
        <Space orientation="vertical" size={16}>
          <Typography.Text className="dashboard-error-eyebrow">
            Registry unavailable
          </Typography.Text>
          <Alert
            type="error"
            showIcon
            title="Failed to load businesses page"
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
