import { App as AntdApp, ConfigProvider } from "antd";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import PublicIssueReportLookup from "@/components/public-issue-report-lookup";
import { getPublicIssueReportByNumber } from "@/lib/api/issue-reports";

vi.mock("@/lib/api/issue-reports", () => ({
  getPublicIssueReportByNumber: vi.fn(),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("PublicIssueReportLookup", () => {
  it("looks up an issue report by reference number", async () => {
    vi.mocked(getPublicIssueReportByNumber).mockResolvedValue({
      category: "fire_hazard",
      createdAt: "2026-05-18T09:15:00.000Z",
      description: "Open wiring near the storefront meter.",
      id: "issue-1",
      locationDescription: "Corner of Mabini and Luna",
      reportNumber: "IR-20260518-ABCD1234",
      reporterEmail: "owner@example.com",
      reporterName: "Alex Dela Cruz",
      reporterPhone: "09171234567",
      status: "submitted",
      subject: "Exposed electrical wiring",
      updatedAt: "2026-05-18T09:15:00.000Z",
    });

    renderWithProviders(<PublicIssueReportLookup />);

    fireEvent.change(screen.getByPlaceholderText("IR-20260518-ABCD1234"), {
      target: { value: "IR-20260518-ABCD1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Check report status" }));

    await waitFor(() => {
      expect(screen.getByText("Exposed electrical wiring")).toBeInTheDocument();
    });
  });

  it("renders an API error when lookup fails", async () => {
    vi.mocked(getPublicIssueReportByNumber).mockRejectedValue(
      new Error("Issue report not found"),
    );

    renderWithProviders(<PublicIssueReportLookup />);

    fireEvent.change(screen.getByPlaceholderText("IR-20260518-ABCD1234"), {
      target: { value: "IR-20260518-MISSING" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Check report status" }));

    await waitFor(() => {
      expect(screen.getByText("Issue report not found")).toBeInTheDocument();
    });
  });
});