"use client";

import * as React from "react";

import { Alert, Button, Card, Input, Space, Tag, Typography } from "antd";

import type { IssueReportRecord } from "@shared/types/api";

import { getApiErrorMessage } from "@/lib/api/http";
import { getPublicIssueReportByNumber } from "@/lib/api/issue-reports";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function PublicIssueReportLookup() {
  const [reportNumber, setReportNumber] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [report, setReport] = React.useState<IssueReportRecord | null>(null);

  async function handleLookup() {
    if (!reportNumber.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getPublicIssueReportByNumber(reportNumber.trim());

      setReport(result);
    } catch (lookupError) {
      setReport(null);
      setError(getApiErrorMessage(lookupError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Track an issue report" className="glass-card">
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Typography.Paragraph style={{ margin: 0 }}>
          Enter a public issue report reference number to check its current
          status.
        </Typography.Paragraph>
        <Input
          placeholder="IR-20260518-ABCD1234"
          value={reportNumber}
          onChange={(event) => setReportNumber(event.target.value)}
        />
        <Button
          type="primary"
          loading={loading}
          onClick={() => void handleLookup()}
        >
          Check report status
        </Button>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        {report ? (
          <Card type="inner" title={report.reportNumber}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Tag color="blue">{report.status.replace("_", " ")}</Tag>
              <Typography.Text strong>{report.subject}</Typography.Text>
              <Typography.Text>{report.description}</Typography.Text>
              {report.locationDescription ? (
                <Typography.Text type="secondary">
                  Location: {report.locationDescription}
                </Typography.Text>
              ) : null}
              <Typography.Text type="secondary">
                Submitted {formatDate(report.createdAt)}
              </Typography.Text>
            </Space>
          </Card>
        ) : null}
      </Space>
    </Card>
  );
}
