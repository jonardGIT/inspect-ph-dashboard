"use client";

import { useState } from "react";
import { Alert, Button, Card, Input, Space, Tag, Typography } from "antd";

import { getApiErrorMessage } from "@/lib/api/http";
import { getPublicPaymentByReferenceNumber } from "@/lib/api/payments";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(value / 100);
}

const statusColors: Record<string, string> = {
  failed: "red",
  paid: "green",
  pending: "gold",
  processing: "blue",
  refunded: "purple",
};

export default function PublicPaymentLookup() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof getPublicPaymentByReferenceNumber>
  > | null>(null);

  async function handleLookup() {
    if (!referenceNumber.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextResult = await getPublicPaymentByReferenceNumber({
        referenceNumber: referenceNumber.trim(),
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
    <Card title="Public payment lookup" className="glass-card">
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        <Typography.Paragraph style={{ margin: 0 }}>
          Check the current payment status for a permit-linked transaction using
          its payment reference number.
        </Typography.Paragraph>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="PAY-20260518-ABCD1234"
            value={referenceNumber}
            onChange={(event) => setReferenceNumber(event.target.value)}
            onPressEnter={() => {
              void handleLookup();
            }}
          />
          <Button
            type="primary"
            loading={isLoading}
            disabled={!referenceNumber.trim()}
            onClick={() => {
              void handleLookup();
            }}
          >
            Lookup payment
          </Button>
        </Space.Compact>

        {error ? <Alert type="error" showIcon title={error} /> : null}

        {result ? (
          <Card type="inner" title={result.referenceNumber}>
            <Space orientation="vertical" size={8} style={{ width: "100%" }}>
              <Space wrap>
                <Tag color={statusColors[result.status] || "default"}>
                  {result.status.replace("_", " ")}
                </Tag>
                <Tag color="blue">{result.permit.permitNumber}</Tag>
                <Tag color="cyan">{result.permit.business.businessName}</Tag>
              </Space>
              <Typography.Text>
                {formatPeso(result.amountInMinor)}
              </Typography.Text>
              <Typography.Text>Provider {result.provider}</Typography.Text>
              {result.paidAt ? (
                <Typography.Text>
                  Paid {formatDate(result.paidAt)}
                </Typography.Text>
              ) : null}
              {result.failureReason ? (
                <Typography.Text type="secondary">
                  Failure reason: {result.failureReason}
                </Typography.Text>
              ) : null}
            </Space>
          </Card>
        ) : null}
      </Space>
    </Card>
  );
}
