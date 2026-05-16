import { Col, Row, Space, Typography } from "antd";

import Providers from "@/components/providers";
import OwnerSupportDesk from "@/components/owner-support-desk";
import PublicFireSafetyCertificateLookup from "@/components/public-fire-safety-certificate-lookup";
import PublicIssueReportLookup from "@/components/public-issue-report-lookup";
import PublicPaymentLookup from "@/components/public-payment-lookup";
import PublicPermitLookup from "@/components/public-permit-lookup";

export default function SupportPage() {
  return (
    <Providers>
      <main className="page-shell">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Typography.Text type="secondary">Owner support desk</Typography.Text>
            <Typography.Title level={2} style={{ margin: 0 }}>
              Support lookups
            </Typography.Title>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              Help business owners and citizens check permit status, inspection
              findings, certificates, payments, and public issue reports from one
              protected workspace.
            </Typography.Paragraph>
          </div>

          <OwnerSupportDesk />

          <Row gutter={[16, 16]}>
            <Col xs={24} xl={12}>
              <PublicPermitLookup />
            </Col>
            <Col xs={24} xl={12}>
              <PublicFireSafetyCertificateLookup />
            </Col>
            <Col xs={24} xl={12}>
              <PublicIssueReportLookup />
            </Col>
            <Col xs={24} xl={12}>
              <PublicPaymentLookup />
            </Col>
          </Row>
        </Space>
      </main>
    </Providers>
  );
}
