import { Card, Col, Row, Skeleton, Space, Typography } from "antd";

interface ModuleBrowserRouteLoadingProps {
  description: string;
  eyebrow: string;
  title: string;
}

export default function ModuleBrowserRouteLoading({
  description,
  eyebrow,
  title,
}: ModuleBrowserRouteLoadingProps) {
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

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={8}>
          <Card className="glass-card">
            <Skeleton active paragraph={{ rows: 6 }} title={{ width: "40%" }} />
          </Card>
        </Col>
        <Col xs={24} xl={16}>
          <Space orientation="vertical" size={20} style={{ width: "100%" }}>
            <Card className="glass-card dashboard-data-card">
              <Skeleton active paragraph={{ rows: 4 }} title />
            </Card>
            <Card className="glass-card dashboard-data-card">
              <Skeleton active paragraph={{ rows: 8 }} title />
            </Card>
          </Space>
        </Col>
      </Row>
    </main>
  );
}
