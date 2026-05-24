"use client";

import { Button, Card, Space, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { OAuthConsentPage } from "@/components/oauth-consent-page";
import { getOAuthClientInfo, grantOAuthConsent } from "@/lib/api/oauth";
import { useAuthSession } from "@/hooks/use-auth-session";

function OAuthAuthorizeState(props: {
  actionLabel?: string;
  description: string;
  onAction?: () => void;
  title: string;
}) {
  return (
    <Card style={{ margin: "auto", maxWidth: 520, width: "100%" }}>
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            {props.title}
          </Typography.Title>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {props.description}
          </Typography.Paragraph>
        </div>
        {props.onAction ? (
          <Button type="primary" onClick={props.onAction}>
            {props.actionLabel ?? "Continue"}
          </Button>
        ) : null}
      </Space>
    </Card>
  );
}

function getAuthorizeRequestError(params: {
  clientId: string;
  redirectUri: string;
  scope: string;
}) {
  if (!params.clientId) {
    return "The authorization request is missing client_id.";
  }

  if (!params.redirectUri) {
    return "The authorization request is missing redirect_uri.";
  }

  if (!params.scope) {
    return "The authorization request is missing scope.";
  }

  return null;
}

function AuthorizeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { accessToken, isHydrated } = useAuthSession();

  const clientId = params.get("client_id") ?? "";
  const redirectUri = params.get("redirect_uri") ?? "";
  const scope = params.get("scope") ?? "";
  const state = params.get("state") ?? undefined;
  const responseType = params.get("response_type") ?? "code";
  const requestError = getAuthorizeRequestError({
    clientId,
    redirectUri,
    scope,
  });

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  if (requestError) {
    return (
      <OAuthAuthorizeState
        description={requestError}
        title="Authorization Error"
      />
    );
  }

  if (!accessToken) {
    return (
      <OAuthAuthorizeState
        actionLabel="Go to login"
        description="Sign in as a business owner to review and approve this OAuth authorization request."
        title="Sign in required"
        onAction={() => router.push("/login")}
      />
    );
  }

  const handleDecision = async (decision: "approve" | "deny") => {
    const { redirectUri: target } = await grantOAuthConsent({
      accessToken,
      client_id: clientId,
      decision,
      redirect_uri: redirectUri,
      scope,
      state,
    });

    router.push(target);
  };

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <OAuthConsentPage
        clientId={clientId}
        fetchClientInfo={getOAuthClientInfo}
        redirectUri={redirectUri}
        responseType={responseType}
        scope={scope}
        onDecision={handleDecision}
      />
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthorizeContent />
    </Suspense>
  );
}
