"use client";

import { Alert, Button, Card, Space, Typography } from "antd";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="page-shell"
      style={{ alignItems: "center", display: "flex", minHeight: "100vh" }}
    >
      <Card style={{ margin: "auto", maxWidth: 520, width: "100%" }}>
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Typography.Text type="secondary">
              Third-party application access
            </Typography.Text>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Authorization page unavailable
            </Typography.Title>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              The consent flow could not be prepared. Retry the page or restart
              the authorization request from the integrating application.
            </Typography.Paragraph>
          </div>
          <Alert
            description={props.error.message}
            showIcon
            title="Failed to load authorization request"
            type="error"
          />
          <Button type="primary" onClick={props.reset}>
            Retry page
          </Button>
        </Space>
      </Card>
    </main>
  );
}
