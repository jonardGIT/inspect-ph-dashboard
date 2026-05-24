"use client";

import { Alert, Button, Card, Space, Typography } from "antd";

interface ModuleBrowserRouteErrorProps {
  description: string;
  error: Error & { digest?: string };
  eyebrow: string;
  reset: () => void;
  title: string;
}

export default function ModuleBrowserRouteError({
  description,
  error,
  eyebrow,
  reset,
  title,
}: ModuleBrowserRouteErrorProps) {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <Typography.Text className="eyebrow">{eyebrow}</Typography.Text>
          <Typography.Title style={{ margin: 0 }}>{title}</Typography.Title>
          <Typography.Paragraph style={{ margin: 0, maxWidth: 780 }}>
            {description}
          </Typography.Paragraph>
        </Space>
      </section>

      <Card className="glass-card dashboard-error-card">
        <Space orientation="vertical" size={16}>
          <Typography.Text className="dashboard-error-eyebrow">
            Module workspace unavailable
          </Typography.Text>
          <Alert
            type="error"
            showIcon
            title={`Failed to load ${title}`}
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
