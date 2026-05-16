import { App as AntdApp, ConfigProvider } from "antd";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import PublicPermitLookup from "@/components/public-permit-lookup";
import {
  getPublicPermitByNumber,
  getPublicPermitFindingsByNumber,
} from "@/lib/api/permits";

vi.mock("@/lib/api/permits", () => ({
  getPublicPermitFindingsByNumber: vi.fn(),
  getPublicPermitByNumber: vi.fn(),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("PublicPermitLookup", () => {
  it("looks up a public permit by permit number", async () => {
    vi.mocked(getPublicPermitByNumber).mockResolvedValue({
      applicationDate: "2026-05-12T08:00:00.000Z",
      business: {
        businessName: "North Star Trading",
        id: "11111111-1111-4111-8111-111111111111",
        ownerName: null,
        contactNumber: null,
        addressLine: null,
        city: null,
      },
      createdAt: "2026-05-12T08:00:00.000Z",
      expirationDate: "2027-05-12T08:00:00.000Z",
      lineOfBusiness: "Retail",
      permitNumber: "BPLO-2026-0001",
      status: "pending_inspection",
      updatedAt: "2026-05-13T10:00:00.000Z",
    });
    vi.mocked(getPublicPermitFindingsByNumber).mockResolvedValue({
      findings: [
        {
          correctiveAction: "Replace damaged signage",
          createdAt: "2026-05-12T08:00:00.000Z",
          description: "Main signboard is damaged",
          dueDate: "2026-05-19T08:00:00.000Z",
          id: "finding-1",
          inspectionId: "inspection-1",
          severity: "high",
          title: "Damaged Signage",
          updatedAt: "2026-05-12T08:00:00.000Z",
        },
      ],
      latestInspection: {
        id: "inspection-1",
        scheduledAt: "2026-05-12T08:00:00.000Z",
        status: "in_progress",
      },
      permit: {
        applicationDate: "2026-05-12T08:00:00.000Z",
        business: {
          businessName: "North Star Trading",
          id: "11111111-1111-4111-8111-111111111111",
          ownerName: null,
          contactNumber: null,
          addressLine: null,
          city: null,
        },
        createdAt: "2026-05-12T08:00:00.000Z",
        expirationDate: "2027-05-12T08:00:00.000Z",
        lineOfBusiness: "Retail",
        permitNumber: "BPLO-2026-0001",
        status: "pending_inspection",
        updatedAt: "2026-05-13T10:00:00.000Z",
      },
    });

    renderWithProviders(<PublicPermitLookup />);

    fireEvent.change(screen.getByPlaceholderText("BPLO-2026-0001"), {
      target: { value: "BPLO-2026-0001" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lookup permit" }));

    await waitFor(() => {
      expect(screen.getByText("North Star Trading")).toBeInTheDocument();
    });
    expect(screen.getByText("Inspection findings")).toBeInTheDocument();
    expect(screen.getByText("Damaged Signage")).toBeInTheDocument();
  });

  it("renders an error when the public permit lookup fails", async () => {
    vi.mocked(getPublicPermitByNumber).mockRejectedValue(
      new Error("Permit record not found"),
    );
    vi.mocked(getPublicPermitFindingsByNumber).mockRejectedValue(
      new Error("Permit record not found"),
    );

    renderWithProviders(<PublicPermitLookup />);

    fireEvent.change(screen.getByPlaceholderText("BPLO-2026-0001"), {
      target: { value: "BPLO-2026-MISSING" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lookup permit" }));

    await waitFor(() => {
      expect(screen.getByText("Permit record not found")).toBeInTheDocument();
    });
  });
});