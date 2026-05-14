import Link from "next/link";
import { Button, Card, Col, Row, Space, Tag } from "antd";

import PublicFireSafetyCertificateLookup from "@/components/public-fire-safety-certificate-lookup";
import PublicIssueReportForm from "@/components/public-issue-report-form";
import PublicIssueReportLookup from "@/components/public-issue-report-lookup";
import PublicPaymentLookup from "@/components/public-payment-lookup";
import PublicPermitLookup from "@/components/public-permit-lookup";

const cards = [
  {
    description:
      "Browse live inspections, filter by status, and open the workspace from the actual queue.",
    href: "/inspections",
    title: "Inspection queue",
  },
  {
    description:
      "Browse permit records and create permits for registered businesses through the existing API.",
    href: "/permits",
    title: "Permit registry",
  },
  {
    description:
      "Browse the BPLO business registry and register establishments through the existing API.",
    href: "/businesses",
    title: "Business registry",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Tag color="green">Inspect PH operations dashboard</Tag>
          <h1 style={{ margin: 0 }}>Inspect PH Dashboard</h1>
          <p style={{ margin: 0, maxWidth: 720 }}>
            The dashboard now has a first BPLO inspection workspace wired to the
            API for inspection detail, checklist results, findings, and
            attachment uploads.
          </p>
          <Space wrap>
            <Button type="primary" size="large">
              <Link href="/inspections">Open inspection queue</Link>
            </Button>
            <span style={{ color: "var(--text-soft)" }}>
              Set NEXT_PUBLIC_API_BASE_URL to point at the API origin.
            </span>
          </Space>
        </Space>
      </section>

      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col key={card.title} xs={24} md={12} lg={8}>
            <Card
              title={card.title}
              className="glass-card"
              extra={<span aria-hidden="true">-&gt;</span>}
            >
              <Space direction="vertical" size={12}>
                <p style={{ margin: 0 }}>{card.description}</p>
                <Button type="link" style={{ padding: 0 }}>
                  <Link href={card.href}>Go to workspace</Link>
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
        <Col xs={24} lg={12}>
          <PublicFireSafetyCertificateLookup />
        </Col>
        <Col xs={24} lg={12}>
          <PublicIssueReportForm />
        </Col>
        <Col xs={24} lg={12}>
          <PublicIssueReportLookup />
        </Col>
        <Col xs={24} lg={12}>
          <PublicPermitLookup />
        </Col>
        <Col xs={24} lg={12}>
          <PublicPaymentLookup />
        </Col>
      </Row>
    </main>
  );
}
