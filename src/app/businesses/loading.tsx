import { Card, Col, Row, Skeleton, Space } from "antd";

export default function BusinessesLoading() {
  return (
    <main className="page-shell">
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Row gutter={[16, 16]} className="dashboard-summary-row">
          {[0, 1, 2].map((index) => (
            <Col key={index} xs={24} md={8}>
              <Card className="glass-card dashboard-metric-card">
                <Skeleton active paragraph={{ rows: 1 }} title={false} />
              </Card>
            </Col>
          ))}
        </Row>
        <Card className="glass-card dashboard-data-card">
          <Skeleton active title paragraph={{ rows: 8 }} />
        </Card>
      </Space>
    </main>
  );
}
