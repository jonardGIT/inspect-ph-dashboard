"use client";

import { Alert, Button, Card, Divider, Space, Tag, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

import type { OAuthConsentInfo } from "@/types";

const { Text, Title } = Typography;

const SCOPE_LABELS: Record<string, string> = {
  "certificate:read": "Read your fire safety certificates",
  "compliance:read": "Read your compliance score",
  "permit:read": "Read your permit records",
};

interface OAuthConsentPageProps {
  clientId: string;
  redirectUri: string;
  responseType: string;
  scope: string;
  onDecision: (decision: "approve" | "deny") => Promise<void>;
  fetchClientInfo: (clientId: string) => Promise<OAuthConsentInfo>;
}

export function OAuthConsentPage({
  clientId,
  fetchClientInfo,
  onDecision,
  redirectUri,
  responseType,
  scope,
}: OAuthConsentPageProps) {
  const [clientInfo, setClientInfo] = useState<OAuthConsentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deciding, setDeciding] = useState<"approve" | "deny" | null>(null);
  const responseTypeError =
    responseType !== "code" ? "Only response_type=code is supported" : null;

  useEffect(() => {
    if (responseTypeError) {
      return;
    }

    fetchClientInfo(clientId)
      .then(setClientInfo)
      .catch(() => setError("Unknown or invalid client application"));
  }, [clientId, fetchClientInfo, responseTypeError]);

  const handleDecision = async (decision: "approve" | "deny") => {
    setDeciding(decision);
    try {
      await onDecision(decision);
    } catch {
      setError("Authorization failed. Please try again.");
      setDeciding(null);
    }
  };

  if (responseTypeError || error) {
    return (
      <Alert
        description={responseTypeError ?? error}
        title="Authorization Error"
        showIcon
        type="error"
      />
    );
  }

  if (!clientInfo) {
    return <div>Loading...</div>;
  }

  if (clientInfo.redirectUri !== redirectUri) {
    return (
      <Alert
        description="The redirect destination does not match the application registration."
        title="Authorization Error"
        showIcon
        type="error"
      />
    );
  }

  const requestedScopes = scope.split(" ").filter(Boolean);

  // Only show scopes that are valid and registered for this client
  const displayScopes = requestedScopes.filter((s) =>
    clientInfo.scopes.includes(s as never),
  );

  if (displayScopes.length === 0) {
    return (
      <Alert
        description="None of the requested scopes are registered for this application."
        title="Invalid scope request"
        showIcon
        type="error"
      />
    );
  }

  return (
    <Card style={{ margin: "auto", maxWidth: 480 }}>
      <Title level={4} style={{ marginBottom: 4 }}>
        Authorize {clientInfo.name}
      </Title>
      {clientInfo.description && (
        <Text type="secondary">{clientInfo.description}</Text>
      )}

      <Divider />

      <Title level={5}>This app wants to:</Title>
      <Space orientation="vertical" style={{ marginBottom: 16, width: "100%" }}>
        {displayScopes.map((s) => (
          <Space key={s} align="start">
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
            <Text>{SCOPE_LABELS[s] ?? s}</Text>
          </Space>
        ))}
      </Space>

      <Alert
        description={
          <>
            Access will be sent to: <Tag>{redirectUri}</Tag>
          </>
        }
        title="Verify the destination"
        showIcon
        type="info"
      />

      <Divider />

      <Space style={{ justifyContent: "flex-end", width: "100%" }}>
        <Button
          disabled={deciding === "approve"}
          icon={<CloseCircleOutlined />}
          loading={deciding === "deny"}
          onClick={() => handleDecision("deny")}
        >
          Deny
        </Button>
        <Button
          icon={<CheckCircleOutlined />}
          loading={deciding === "approve"}
          type="primary"
          onClick={() => handleDecision("approve")}
        >
          Allow access
        </Button>
      </Space>
    </Card>
  );
}
