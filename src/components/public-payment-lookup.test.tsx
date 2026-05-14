import { App as AntdApp, ConfigProvider } from "antd";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import PublicPaymentLookup from "@/components/public-payment-lookup";
import { getPublicPaymentByReferenceNumber } from "@/lib/api/payments";

vi.mock("@/lib/api/payments", () => ({
  getPublicPaymentByReferenceNumber: vi.fn(),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("PublicPaymentLookup", () => {
  it("looks up a public payment by reference number", async () => {
    vi.mocked(getPublicPaymentByReferenceNumber).mockResolvedValue({
      amountInMinor: 125000,
      createdAt: "2026-05-18T09:15:00.000Z",
      currency: "PHP",
      id: "payment-1",
      permit: {
        business: {
          businessName: "North Star Trading",
          id: "business-1",
        },
        id: "permit-1",
        permitNumber: "BPLO-2026-0001",
      },
      provider: "local",
      referenceNumber: "PAY-20260518-ABCD1234",
      status: "processing",
      updatedAt: "2026-05-18T09:15:00.000Z",
    });

    renderWithProviders(<PublicPaymentLookup />);

    fireEvent.change(screen.getByPlaceholderText("PAY-20260518-ABCD1234"), {
      target: { value: "PAY-20260518-ABCD1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lookup payment" }));

    await waitFor(() => {
      expect(screen.getByText("North Star Trading")).toBeInTheDocument();
    });
  });

  it("renders an API error when lookup fails", async () => {
    vi.mocked(getPublicPaymentByReferenceNumber).mockRejectedValue(
      new Error("Payment not found"),
    );

    renderWithProviders(<PublicPaymentLookup />);

    fireEvent.change(screen.getByPlaceholderText("PAY-20260518-ABCD1234"), {
      target: { value: "PAY-20260518-MISSING" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lookup payment" }));

    await waitFor(() => {
      expect(screen.getByText("Payment not found")).toBeInTheDocument();
    });
  });
});
