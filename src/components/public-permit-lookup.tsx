"use client";

import { useState } from "react";
import { Alert, Button, Card, Input, Space, Tag, Typography } from "antd";

import { getApiErrorMessage } from "@/lib/api/http";
import {
  getPublicPermitByNumber,
  getPublicPermitFindingsByNumber,
} from "@/lib/api/permits";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const statusColors: Record<string, string> = {
  approved: "green",
  draft: "default",
  expired: "red",
  pending_inspection: "gold",
  rejected: "red",
};

export default function PublicPermitLookup() {
  const [permitNumber, setPermitNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof getPublicPermitByNumber>
  > | null>(null);
  const [findingsResult, setFindingsResult] = useState<Awaited<
    ReturnType<typeof getPublicPermitFindingsByNumber>
  > | null>(null);

  async function handleLookup() {
    if (!permitNumber.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nextResult, nextFindingsResult] = await Promise.all([
        getPublicPermitByNumber({
          permitNumber: permitNumber.trim(),
        }),
        getPublicPermitFindingsByNumber({
          permitNumber: permitNumber.trim(),
        }),
      ]);

      setResult(nextResult);
      setFindingsResult(nextFindingsResult);
    } catch (lookupError) {
      setFindingsResult(null);
      setResult(null);
      setError(getApiErrorMessage(lookupError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card title="Public permit lookup" className="glass-card">
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Typography.Paragraph style={{ margin: 0 }}>
          Business owners can check permit application status by permit number
          without signing in.
        </Typography.Paragraph>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="BPLO-2026-0001"
            value={permitNumber}
            onChange={(event) => setPermitNumber(event.target.value)}
            onPressEnter={() => {
              void handleLookup();
            }}
          />
          <Button
            type="primary"
            loading={isLoading}
            disabled={!permitNumber.trim()}
            onClick={() => {
              void handleLookup();
            }}
          >
            Lookup permit
          </Button>
        </Space.Compact>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        {result ? (
          <Card type="inner" title={result.permitNumber}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Space wrap>
                <Tag color={statusColors[result.status] || "default"}>
                  {result.status.replace("_", " ")}
                </Tag>
                <Tag color="blue">{result.business.businessName}</Tag>
              </Space>
              <Typography.Text>{result.lineOfBusiness}</Typography.Text>
              <Typography.Text>
                Application filed {formatDate(result.applicationDate)}
              </Typography.Text>
              <Typography.Text>
                Permit expires {formatDate(result.expirationDate)}
              </Typography.Text>
              <Typography.Text type="secondary">
                Last updated {formatDate(result.updatedAt)}
              </Typography.Text>
              {findingsResult?.latestInspection ? (
                <Typography.Text type="secondary">
                  Latest inspection {findingsResult.latestInspection.status.replace("_", " ")}
                </Typography.Text>
              ) : null}
              {findingsResult ? (
                findingsResult.findings.length ? (
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Typography.Text strong>Inspection findings</Typography.Text>
                    {findingsResult.findings.map((finding) => (
                      <Card key={finding.id} type="inner" size="small">
                        <Space direction="vertical" size={4} style={{ width: "100%" }}>
                          <Space wrap>
                            <Tag color={finding.resolvedAt ? "green" : "gold"}>
                              {finding.resolvedAt ? "resolved" : "open"}
                            </Tag>
                            <Tag color="red">{finding.severity}</Tag>
                          </Space>
                          <Typography.Text strong>{finding.title}</Typography.Text>
                          <Typography.Text>{finding.description}</Typography.Text>
                          {finding.correctiveAction ? (
                            <Typography.Text type="secondary">
                              Corrective action: {finding.correctiveAction}
                            </Typography.Text>
                          ) : null}
                          {finding.dueDate ? (
                            <Typography.Text type="secondary">
                              Due {formatDate(finding.dueDate)}
                            </Typography.Text>
                          ) : null}
                        </Space>
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <Typography.Text type="secondary">
                    No findings recorded for the latest inspection.
                  </Typography.Text>
                )
              ) : null}
            </Space>
          </Card>
        ) : null}
      </Space>
    </Card>
  );
}