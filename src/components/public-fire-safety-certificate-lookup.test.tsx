import { App as AntdApp, ConfigProvider } from "antd";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import PublicFireSafetyCertificateLookup from "@/components/public-fire-safety-certificate-lookup";
import { getPublicFireSafetyCertificateByNumber } from "@/lib/api/fire-safety-certificates";

vi.mock("@/lib/api/fire-safety-certificates", () => ({
  getPublicFireSafetyCertificateByNumber: vi.fn(),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("PublicFireSafetyCertificateLookup", () => {
  it("looks up and renders a public FireGuard certificate", async () => {
    vi.mocked(getPublicFireSafetyCertificateByNumber).mockResolvedValue({
      business: {
        businessName: "Apex Cold Storage",
      },
      certificateNumber: "FSIC-DEV-2026-0001",
      expiresAt: "2027-05-17T13:30:00.000Z",
      inspection: {
        scheduledAt: "2026-05-17T13:30:00.000Z",
        status: "scheduled" as const,
      },
      issuedAt: "2026-05-17T13:30:00.000Z",
      office: {
        code: "FIRE-HQ",
        name: "Fire Safety Headquarters",
      },
      permit: {
        permitNumber: "FIRE-DEV-2026-0001",
      },
      remarks: "Seeded certificate",
      status: "issued" as const,
    });

    renderWithProviders(<PublicFireSafetyCertificateLookup />);

    fireEvent.change(screen.getByPlaceholderText("FSIC-DEV-2026-0001"), {
      target: { value: "FSIC-DEV-2026-0001" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lookup certificate" }));

    await waitFor(() => {
      expect(screen.getByText("Apex Cold Storage")).toBeInTheDocument();
    });

    expect(screen.getByText("Fire Safety Headquarters")).toBeInTheDocument();
    expect(screen.getByText(/Permit FIRE-DEV-2026-0001/)).toBeInTheDocument();
  });

  it("renders an API error when lookup fails", async () => {
    vi.mocked(getPublicFireSafetyCertificateByNumber).mockRejectedValue(
      new Error("Fire safety certificate not found"),
    );

    renderWithProviders(<PublicFireSafetyCertificateLookup />);

    fireEvent.change(screen.getByPlaceholderText("FSIC-DEV-2026-0001"), {
      target: { value: "UNKNOWN-FSIC" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lookup certificate" }));

    await waitFor(() => {
      expect(
        screen.getByText("Fire safety certificate not found"),
      ).toBeInTheDocument();
    });
  });
});
