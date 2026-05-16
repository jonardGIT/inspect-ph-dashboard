import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import PaymentReconciliation from "@/components/payment-reconciliation";
import { usePaymentReconciliation } from "@/hooks/use-payment-reconciliation";

vi.mock("@/hooks/use-payment-reconciliation", () => ({
  usePaymentReconciliation: vi.fn(),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

const baseHook = {
  data: undefined,
  error: null,
  fromDate: undefined,
  isLoading: false,
  officeId: undefined,
  refetch: vi.fn(),
  setFromDate: vi.fn(),
  setOfficeId: vi.fn(),
  setToDate: vi.fn(),
  toDate: undefined,
};

describe("PaymentReconciliation", () => {
  it("shows loading state", () => {
    vi.mocked(usePaymentReconciliation).mockReturnValue({
      ...baseHook,
      isLoading: true,
    });

    renderWithProviders(<PaymentReconciliation />);
    expect(screen.getByText(/payment reconciliation/i)).toBeDefined();
  });

  it("shows error state", () => {
    vi.mocked(usePaymentReconciliation).mockReturnValue({
      ...baseHook,
      error: new Error("Network error"),
    });

    renderWithProviders(<PaymentReconciliation />);
    expect(screen.getByText(/failed to load/i)).toBeDefined();
  });

  it("renders summary totals and office table when data is present", () => {
    vi.mocked(usePaymentReconciliation).mockReturnValue({
      ...baseHook,
      data: {
        agingUnpaidAmountInMinor: 500000,
        agingUnpaidCount: 1,
        byOffice: [
          {
            lguId: "lgu-1",
            officeCode: "BFP-001",
            officeId: "office-1",
            officeName: "BFP Tuguegarao",
            paidAmountInMinor: 1000000,
            paidCount: 5,
            unpaidAmountInMinor: 200000,
            unpaidCount: 2,
          },
        ],
        fromDate: "2026-01-01",
        toDate: "2026-05-01",
        totalPaidAmountInMinor: 1000000,
        totalPaidCount: 5,
        totalUnpaidAmountInMinor: 700000,
        totalUnpaidCount: 3,
      },
    });

    renderWithProviders(<PaymentReconciliation />);
    expect(screen.getByText("BFP Tuguegarao")).toBeDefined();
    expect(screen.getByText("BFP-001")).toBeDefined();
    expect(screen.getByText("Export CSV")).toBeDefined();
  });
});
