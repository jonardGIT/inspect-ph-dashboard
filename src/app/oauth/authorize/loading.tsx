import { Card, Skeleton, Space, Typography } from "antd";

export default function Loading() {
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
              Preparing authorization request
            </Typography.Title>
          </div>
          <Skeleton active paragraph={{ rows: 4 }} title={{ width: "55%" }} />
          <Skeleton.Button active block />
        </Space>
      </Card>
    </main>
  );
}
