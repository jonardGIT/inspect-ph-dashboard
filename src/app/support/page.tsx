import { Col, Row, Space, Typography } from "antd";

import Providers from "@/components/providers";
import OwnerSupportDesk from "@/components/owner-support-desk";
import PublicFireSafetyCertificateLookup from "@/components/public-fire-safety-certificate-lookup";
import PublicIssueReportLookup from "@/components/public-issue-report-lookup";
import PublicPaymentLookup from "@/components/public-payment-lookup";
import PublicPermitLookup from "@/components/public-permit-lookup";

const { Paragraph, Text, Title } = Typography;

export default function SupportPage() {
  return (
    <Providers>
      <main className="page-shell">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Text type="secondary">Owner support desk</Text>
            <Title level={2} style={{ margin: 0 }}>
              Support lookups
            </Title>
            <Paragraph style={{ marginBottom: 0 }}>
              Help business owners and citizens check permit status, inspection
              findings, certificates, payments, fee history, and recent owner
              activity from one protected workspace.
            </Paragraph>
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
