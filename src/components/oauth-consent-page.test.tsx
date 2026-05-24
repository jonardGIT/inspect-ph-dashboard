import { App as AntdApp, ConfigProvider } from "antd";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { OAuthConsentPage } from "@/components/oauth-consent-page";
import type { OAuthConsentInfo } from "@/types";

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

const baseClientInfo: OAuthConsentInfo = {
  clientId: "client-123",
  description: "Partner integration",
  name: "Partner App",
  redirectUri: "https://partner.example/callback",
  scopes: ["permit:read", "certificate:read"],
};

describe("OAuthConsentPage", () => {
  it("shows a client lookup error when client info cannot be loaded", async () => {
    renderWithProviders(
      <OAuthConsentPage
        clientId="client-123"
        fetchClientInfo={vi.fn().mockRejectedValue(new Error("not found"))}
        onDecision={vi.fn()}
        redirectUri="https://partner.example/callback"
        responseType="code"
        scope="permit:read"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Authorization Error")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Unknown or invalid client application"),
    ).toBeInTheDocument();
  });

  it("shows a redirect mismatch error when the request URI differs from the registered client", async () => {
    renderWithProviders(
      <OAuthConsentPage
        clientId="client-123"
        fetchClientInfo={vi.fn().mockResolvedValue(baseClientInfo)}
        onDecision={vi.fn()}
        redirectUri="https://attacker.example/callback"
        responseType="code"
        scope="permit:read"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Authorization Error")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "The redirect destination does not match the application registration.",
      ),
    ).toBeInTheDocument();
  });

  it("shows an invalid scope error when none of the requested scopes are allowed", async () => {
    renderWithProviders(
      <OAuthConsentPage
        clientId="client-123"
        fetchClientInfo={vi.fn().mockResolvedValue(baseClientInfo)}
        onDecision={vi.fn()}
        redirectUri="https://partner.example/callback"
        responseType="code"
        scope="compliance:read"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Invalid scope request")).toBeInTheDocument();
    });
  });

  it("shows an authorization failure when the consent decision request fails", async () => {
    const onDecision = vi.fn().mockRejectedValue(new Error("failed"));

    renderWithProviders(
      <OAuthConsentPage
        clientId="client-123"
        fetchClientInfo={vi.fn().mockResolvedValue(baseClientInfo)}
        onDecision={onDecision}
        redirectUri="https://partner.example/callback"
        responseType="code"
        scope="permit:read"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Authorize Partner App")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /allow access/i }));

    await waitFor(() => {
      expect(screen.getByText("Authorization Error")).toBeInTheDocument();
    });

    expect(onDecision).toHaveBeenCalledWith("approve");
    expect(
      screen.getByText("Authorization failed. Please try again."),
    ).toBeInTheDocument();
  });
});
