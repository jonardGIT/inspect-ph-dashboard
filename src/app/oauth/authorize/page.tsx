"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { OAuthConsentPage } from "@/components/oauth-consent-page";
import { getOAuthClientInfo, grantOAuthConsent } from "@/lib/api/oauth";
import { useAuthSession } from "@/hooks/use-auth-session";

function AuthorizeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { accessToken } = useAuthSession();

  const clientId = params.get("client_id") ?? "";
  const redirectUri = params.get("redirect_uri") ?? "";
  const scope = params.get("scope") ?? "";
  const state = params.get("state") ?? undefined;
  const responseType = params.get("response_type") ?? "code";

  const handleDecision = async (decision: "approve" | "deny") => {
    if (!accessToken) return;

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
        accessToken={accessToken ?? ""}
        clientId={clientId}
        fetchClientInfo={getOAuthClientInfo}
        redirectUri={redirectUri}
        responseType={responseType}
        scope={scope}
        state={state}
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
