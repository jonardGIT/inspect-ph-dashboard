import { Card, Col, Row, Skeleton, Space } from "antd";

export default function InspectionDetailLoading() {
  return (
    <main className="page-shell">
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
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
          <Skeleton active title paragraph={{ rows: 6 }} />
        </Card>
        <Row gutter={[20, 20]}>
          {[0, 1].map((index) => (
            <Col key={index} xs={24} lg={12}>
              <Card className="glass-card dashboard-data-card">
                <Skeleton active title paragraph={{ rows: 5 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Card className="glass-card dashboard-data-card">
          <Skeleton active title paragraph={{ rows: 4 }} />
        </Card>
      </Space>
    </main>
  );
}
