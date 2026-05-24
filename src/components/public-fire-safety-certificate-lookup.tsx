"use client";

import { useState } from "react";
import { Alert, Button, Card, Input, Space, Tag, Typography } from "antd";

import { getPublicFireSafetyCertificateByNumber } from "@/lib/api/fire-safety-certificates";
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

export default function PublicFireSafetyCertificateLookup() {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof getPublicFireSafetyCertificateByNumber>
  > | null>(null);

  async function handleLookup() {
    if (!certificateNumber.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextResult = await getPublicFireSafetyCertificateByNumber({
        certificateNumber: certificateNumber.trim(),
      });

      setResult(nextResult);
    } catch (lookupError) {
      setResult(null);
      setError(getApiErrorMessage(lookupError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card title="Public certificate lookup" className="glass-card">
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        <Typography.Paragraph style={{ margin: 0 }}>
          Owners can verify a FireGuard certificate by certificate number
          without signing in.
        </Typography.Paragraph>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="FSIC-DEV-2026-0001"
            value={certificateNumber}
            onChange={(event) => setCertificateNumber(event.target.value)}
            onPressEnter={() => {
              void handleLookup();
            }}
          />
          <Button
            type="primary"
            loading={isLoading}
            disabled={!certificateNumber.trim()}
            onClick={() => {
              void handleLookup();
            }}
          >
            Lookup certificate
          </Button>
        </Space.Compact>

        {error ? <Alert type="error" showIcon title={error} /> : null}

        {result ? (
          <Card type="inner" title={result.certificateNumber}>
            <Space orientation="vertical" size={8} style={{ width: "100%" }}>
              <Space wrap>
                <Tag color={statusColors[result.status] || "default"}>
                  {result.status}
                </Tag>
                <Tag color="blue">{result.business.businessName}</Tag>
                <Tag color="cyan">{result.office.name}</Tag>
              </Space>
              <Typography.Text>
                Permit {result.permit.permitNumber}
              </Typography.Text>
              <Typography.Text>
                Issued {formatDate(result.issuedAt)}
              </Typography.Text>
              <Typography.Text>
                Expires {formatDate(result.expiresAt)}
              </Typography.Text>
              <Typography.Text type="secondary">
                Inspection status: {result.inspection.status.replace("_", " ")}
              </Typography.Text>
              {result.remarks ? (
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                  {result.remarks}
                </Typography.Paragraph>
              ) : null}
            </Space>
          </Card>
        ) : null}
      </Space>
    </Card>
  );
}
