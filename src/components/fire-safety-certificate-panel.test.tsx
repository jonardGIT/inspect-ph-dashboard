import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import FireSafetyCertificatePanel from "@/components/fire-safety-certificate-panel";
import { useFireSafetyCertificates } from "@/hooks/use-fire-safety-certificates";

vi.mock("@/hooks/use-fire-safety-certificates", () => ({
  useFireSafetyCertificates: vi.fn(),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("FireSafetyCertificatePanel", () => {
  it("renders certificate cards for the FireGuard office", () => {
    vi.mocked(useFireSafetyCertificates).mockReturnValue({
      certificatesQuery: {
        data: {
          data: [
            {
              certificateNumber: "FSIC-DEV-2026-0001",
              createdAt: "2026-05-17T13:30:00.000Z",
              expiresAt: "2027-05-17T13:30:00.000Z",
              id: "certificate-1",
              inspection: {
                business: {
                  businessName: "Apex Cold Storage",
                  id: "business-1",
                },
                id: "inspection-1",
                office: {
                  code: "FIRE-HQ",
                  id: "office-fire",
                  lguId: "lgu-1",
                  name: "Fire Safety Headquarters",
                },
                permit: {
                  id: "permit-1",
                  permitNumber: "FIRE-DEV-2026-0001",
                },
                scheduledAt: "2026-05-17T13:30:00.000Z",
                status: "scheduled",
              },
              issuedAt: "2026-05-17T13:30:00.000Z",
              remarks:
                "Seeded FireGuard certificate proving module-specific support.",
              status: "issued",
              updatedAt: "2026-05-17T13:30:00.000Z",
            },
          ],
          meta: { limit: 5, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useFireSafetyCertificates>);

    renderWithProviders(
      <FireSafetyCertificatePanel
        accessToken="token"
        officeId="office-fire"
        officeLabel="Fire Safety Headquarters · FIRE-HQ"
      />,
    );

    expect(screen.getByText("Fire safety certificates")).toBeInTheDocument();
    expect(screen.getByText("FSIC-DEV-2026-0001")).toBeInTheDocument();
    expect(screen.getByText(/Apex Cold Storage/)).toBeInTheDocument();
    expect(screen.getByText(/Open inspection workspace/)).toBeInTheDocument();
  });

  it("renders an empty state when no certificates are available", () => {
    vi.mocked(useFireSafetyCertificates).mockReturnValue({
      certificatesQuery: {
        data: {
          data: [],
          meta: { limit: 5, page: 1, total: 0 },
        },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useFireSafetyCertificates>);

    renderWithProviders(
      <FireSafetyCertificatePanel
        accessToken="token"
        officeId="office-fire"
        officeLabel="Fire Safety Headquarters · FIRE-HQ"
      />,
    );

    expect(
      screen.getByText("No FireGuard certificates found for this office yet"),
    ).toBeInTheDocument();
  });
});
