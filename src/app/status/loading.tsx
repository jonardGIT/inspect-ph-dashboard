import { Card, Col, Row, Skeleton, Space } from "antd";

export default function StatusLoading() {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Skeleton.Input active style={{ width: 220 }} />
          <Skeleton.Input active block style={{ height: 42 }} />
          <Skeleton active paragraph={{ rows: 2 }} title={false} />
        </Space>
      </section>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card className="glass-card">
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="glass-card">
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </Col>
      </Row>
    </main>
  );
}
