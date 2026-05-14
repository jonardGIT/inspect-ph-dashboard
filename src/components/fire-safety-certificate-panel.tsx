"use client";

import Link from "next/link";
import { Alert, Button, Card, Empty, Space, Spin, Tag, Typography } from "antd";

import { useFireSafetyCertificates } from "@/hooks/use-fire-safety-certificates";
import { getApiErrorMessage } from "@/lib/api/http";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const statusColors: Record<string, string> = {
  draft: "default",
  expired: "red",
  issued: "green",
  revoked: "gold",
};

export default function FireSafetyCertificatePanel(input: {
  accessToken: string;
  officeId: string;
  officeLabel: string;
}) {
  const { certificatesQuery } = useFireSafetyCertificates({
    accessToken: input.accessToken,
    limit: 5,
    officeId: input.officeId,
    page: 1,
  });

  const certificates = certificatesQuery.data?.data ?? [];

  return (
    <Card
      title="Fire safety certificates"
      className="glass-card dashboard-data-card"
      style={{ marginBottom: 20 }}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Paragraph style={{ margin: 0 }}>
          FSIC records issued for {input.officeLabel} appear here as the first
          FireGuard-specific reporting surface on top of the shared inspection
          queue.
        </Typography.Paragraph>

        {certificatesQuery.isLoading ? <Spin size="large" /> : null}

        {certificatesQuery.error ? (
          <Alert
            type="error"
            showIcon
            message={getApiErrorMessage(certificatesQuery.error)}
          />
        ) : null}

        {!certificatesQuery.isLoading &&
        !certificatesQuery.error &&
        !certificates.length ? (
          <Empty description="No FireGuard certificates found for this office yet" />
        ) : null}

        {!certificatesQuery.isLoading && !certificatesQuery.error
          ? certificates.map((certificate) => (
              <Card
                key={certificate.id}
                type="inner"
                title={certificate.certificateNumber}
              >
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <Space wrap>
                    <Tag color={statusColors[certificate.status] || "default"}>
                      {certificate.status}
                    </Tag>
                    <Tag color="blue">
                      Business: {certificate.inspection.business.businessName}
                    </Tag>
                    <Tag color="cyan">
                      Permit: {certificate.inspection.permit.permitNumber}
                    </Tag>
                  </Space>
                  <Typography.Text>
                    Issued {formatDate(certificate.issuedAt)}
                  </Typography.Text>
                  <Typography.Text>
                    Expires {formatDate(certificate.expiresAt)}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    Inspection status:{" "}
                    {certificate.inspection.status.replace("_", " ")}
                  </Typography.Text>
                  {certificate.remarks ? (
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      {certificate.remarks}
                    </Typography.Paragraph>
                  ) : null}
                  <Button type="link" style={{ padding: 0 }}>
                    <Link href={`/inspections/${certificate.inspection.id}`}>
                      Open inspection workspace
                    </Link>
                  </Button>
                </Space>
              </Card>
            ))
          : null}
      </Space>
    </Card>
  );
}
