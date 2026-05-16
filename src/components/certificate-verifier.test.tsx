import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import CertificateVerifierPanel from "@/components/certificate-verifier";
import { getPublicCertificateVerification } from "@/lib/api/certificate-verify";

vi.mock("@/lib/api/certificate-verify", () => ({
  createFireSafetyCertificate: vi.fn(),
  getPublicCertificateVerification: vi.fn(),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("CertificateVerifierPanel", () => {
  it("shows loading initially", () => {
    vi.mocked(getPublicCertificateVerification).mockReturnValue(
      new Promise(() => {
        // never resolves
      }),
    );

    renderWithProviders(
      <CertificateVerifierPanel certificateNumber="FSIC-001" />,
    );
    expect(screen.getByText(/verifying certificate/i)).toBeDefined();
  });

  it("shows valid certificate details on success", async () => {
    vi.mocked(getPublicCertificateVerification).mockResolvedValue({
      business: "Acme Corp",
      certificateNumber: "FSIC-001",
      expiresAt: "2027-01-01T00:00:00.000Z",
      issuedAt: "2026-01-01T00:00:00.000Z",
      status: "issued",
      valid: true,
    });

    renderWithProviders(
      <CertificateVerifierPanel certificateNumber="FSIC-001" />,
    );

    await waitFor(() => {
      expect(screen.getByText(/valid and authentic/i)).toBeDefined();
    });

    expect(screen.getByText("Acme Corp")).toBeDefined();
  });

  it("shows not-found error when API throws", async () => {
    vi.mocked(getPublicCertificateVerification).mockRejectedValue(
      new Error("Not found"),
    );

    renderWithProviders(
      <CertificateVerifierPanel certificateNumber="FSIC-INVALID" />,
    );

    await waitFor(() => {
      // The Result component renders title and subtitle
      const el =
        screen.queryByText(/certificate not found or could not be verified/i) ??
        screen.queryByText(/certificate not found/i) ??
        screen.queryByText(/not found/i);
      expect(el).not.toBeNull();
    });
  });

  it("shows invalid state when valid is false", async () => {
    vi.mocked(getPublicCertificateVerification).mockResolvedValue({
      business: "Revoked Biz",
      certificateNumber: "FSIC-002",
      expiresAt: undefined,
      issuedAt: "2025-01-01T00:00:00.000Z",
      status: "revoked",
      valid: false,
    });

    renderWithProviders(
      <CertificateVerifierPanel certificateNumber="FSIC-002" />,
    );

    await waitFor(() => {
      expect(screen.getByText(/not currently valid/i)).toBeDefined();
    });
  });
});
