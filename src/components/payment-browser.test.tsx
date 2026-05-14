import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import PaymentBrowser from "@/components/payment-browser";
import { useAuthSession } from "@/hooks/use-auth-session";
import { usePaymentsBrowser } from "@/hooks/use-payments-browser";

const replace = vi.fn();

vi.mock("@/hooks/use-auth-session", () => ({
  useAuthSession: vi.fn(),
}));

vi.mock("@/hooks/use-payments-browser", () => ({
  usePaymentsBrowser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/payments",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/inspection-route-shell", () => ({
  default: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("PaymentBrowser", () => {
  it("renders payment reconciliation rows for admins", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "token",
      session: { user: { role: "admin" } },
    } as never);

    vi.mocked(usePaymentsBrowser).mockReturnValue({
      paymentsQuery: {
        data: {
          data: [
            {
              amountInMinor: 125000,
              checkoutUrl:
                "http://localhost:4000/api/v1/payments/public/PAY-20260518-ABCD1234",
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
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
    } as never);

    renderWithProviders(<PaymentBrowser />);

    expect(screen.getByText("Payments")).toBeInTheDocument();
    expect(screen.getByText("PAY-20260518-ABCD1234")).toBeInTheDocument();
    expect(screen.getByText("North Star Trading")).toBeInTheDocument();
  });

  it("shows an admin-only warning for inspectors", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "token",
      session: { user: { role: "inspector" } },
    } as never);

    vi.mocked(usePaymentsBrowser).mockReturnValue({
      paymentsQuery: {
        data: { data: [], meta: { limit: 10, page: 1, total: 0 } },
        error: null,
        isLoading: false,
      },
    } as never);

    renderWithProviders(<PaymentBrowser />);

    expect(
      screen.getByText("Payments access is limited to admins."),
    ).toBeInTheDocument();
  });
});
