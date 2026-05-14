import { App as AntdApp, ConfigProvider } from "antd";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import PublicIssueReportForm from "@/components/public-issue-report-form";
import { createPublicIssueReport } from "@/lib/api/issue-reports";

vi.mock("@/lib/api/issue-reports", () => ({
  createPublicIssueReport: vi.fn(),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("PublicIssueReportForm", () => {
  it("submits a public issue report and shows the reference number", async () => {
    vi.mocked(createPublicIssueReport).mockResolvedValue({
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

    renderWithProviders(<PublicIssueReportForm />);

    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Exposed electrical wiring" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Open wiring near the storefront meter." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Submit issue report" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Report submitted: IR-20260518-ABCD1234"),
      ).toBeInTheDocument();
    });
  });

  it("renders an API error when submission fails", async () => {
    vi.mocked(createPublicIssueReport).mockRejectedValue(
      new Error("Unable to submit issue report"),
    );

    renderWithProviders(<PublicIssueReportForm />);

    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Blocked exit" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Emergency exit is blocked by inventory." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Submit issue report" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Unable to submit issue report"),
      ).toBeInTheDocument();
    });
  });
});
