"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Card,
  Descriptions,
  Result,
  Spin,
  Typography,
} from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import type { CertificateVerificationResult } from "@shared/types/api";

import { getPublicCertificateVerification } from "@/lib/api/certificate-verify";

const { Text } = Typography;

function StatusBadge({ status }: { status: string | undefined }) {
  const map: Record<string, "success" | "warning" | "error" | "default"> = {
    issued: "success",
    draft: "warning",
    revoked: "error",
    expired: "default",
  };
  return (
    <Badge
      status={map[status ?? ""] ?? "default"}
      text={
        <Text strong style={{ textTransform: "capitalize" }}>
          {status ?? "unknown"}
        </Text>
      }
    />
  );
}

export default function CertificateVerifierPanel({
  certificateNumber,
}: {
  certificateNumber: string;
}) {
  const [state, setState] = useState<{
    certificateNumber: string;
    error: string | null;
    isLoading: boolean;
    result: CertificateVerificationResult | null;
  }>({
    certificateNumber: "",
    error: null,
    isLoading: true,
    result: null,
  });

  useEffect(() => {
    let cancelled = false;

    getPublicCertificateVerification({ certificateNumber })
      .then((result) => {
        if (cancelled) {
          return;
        }

        setState({
          certificateNumber,
          error: null,
          isLoading: false,
          result,
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setState({
          certificateNumber,
          error: "Certificate not found or could not be verified.",
          isLoading: false,
          result: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [certificateNumber]);

  const loading =
    state.isLoading || state.certificateNumber !== certificateNumber;
  const { error, result } = state;

  if (loading) {
    return (
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        <Spin size="large" description="Verifying certificate…" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <Result
        status="error"
        icon={<CloseCircleFilled style={{ color: "#ff4d4f" }} />}
        title="Certificate not found"
        subTitle={
          error ??
          "No certificate matches this number in the InspectPH registry."
        }
      />
    );
  }

  return (
    <Card
      style={{ maxWidth: 640, margin: "0 auto" }}
      title={
        <span>
          <SafetyCertificateOutlined style={{ marginRight: 8 }} />
          Certificate Verification — {result.certificateNumber}
        </span>
      }
    >
      {result.valid ? (
        <Alert
          type="success"
          icon={<CheckCircleFilled />}
          title="This certificate is valid and authentic"
          showIcon
          style={{ marginBottom: 20 }}
        />
      ) : (
        <Alert
          type="error"
          icon={<CloseCircleFilled />}
          title="This certificate is not currently valid"
          description={`Status: ${result.status ?? "unknown"}`}
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Certificate number">
          <Text code>{result.certificateNumber}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Business">
          {result.business ?? "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <StatusBadge status={result.status} />
        </Descriptions.Item>
        <Descriptions.Item label="Issued">
          {result.issuedAt
            ? new Date(result.issuedAt).toLocaleDateString("en-PH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Expires">
          {result.expiresAt
            ? new Date(result.expiresAt).toLocaleDateString("en-PH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "—"}
        </Descriptions.Item>
      </Descriptions>

      <Text
        type="secondary"
        style={{ display: "block", fontSize: 12, marginTop: 16 }}
      >
        Verified against the InspectPH certificate registry. This page is
        publicly accessible and does not require an account.
      </Text>
    </Card>
  );
}
