import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthSession } from "@/hooks/use-auth-session";
import { usePermitBrowser } from "@/hooks/use-permit-browser";

import PermitBrowser from "./permit-browser";

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/hooks/use-permit-browser", () => ({ usePermitBrowser: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/permits",
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient();

  return render(
    <ConfigProvider>
      <AntdApp>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </AntdApp>
    </ConfigProvider>,
  );
}

describe("PermitBrowser", () => {
  beforeEach(() => {
    vi.mocked(usePermitBrowser).mockReturnValue({
      archivePermitMutation: { mutate: vi.fn() },
      createPermitMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      permitsQuery: {
        data: {
          data: [],
          meta: { limit: 10, page: 1, total: 0 },
        },
        error: null,
        isLoading: false,
      },
      updatePermitMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
    } as never);
  });

  it("renders the permits heading and records card", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "",
      isHydrated: true,
      loginMutation: { error: null, isPending: false, mutateAsync: vi.fn() },
      logout: vi.fn(),
      session: null,
    } as never);

    renderWithProviders(<PermitBrowser />);

    expect(screen.getByText("Permits")).toBeInTheDocument();
    expect(screen.getByText("Permit records")).toBeInTheDocument();
    expect(screen.getByText("Dashboard session")).toBeInTheDocument();
  });

  it("shows the payment status column for permit records", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "token",
      isHydrated: true,
      loginMutation: { error: null, isPending: false, mutateAsync: vi.fn() },
      logout: vi.fn(),
      session: {
        tokens: {
          accessToken: "token",
          expiresIn: 900,
          refreshToken: "refresh",
        },
        user: {
          createdAt: "2026-05-14T08:00:00.000Z",
          email: "clerk@example.com",
          id: "clerk-1",
          name: "Clerk",
          officeIds: ["office-1"],
          role: "office_clerk",
          roleProfile: {
            accessScope: "office",
            label: "Office Clerk",
            permissions: ["permit:read", "payment:read"],
          },
        },
      },
    } as never);
    vi.mocked(usePermitBrowser).mockReturnValue({
      archivePermitMutation: { mutate: vi.fn() },
      createPermitMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      permitsQuery: {
        data: {
          data: [
            {
              applicationDate: "2026-05-12T08:00:00.000Z",
              business: {
                businessName: "Riverside Food Hub",
                id: "business-1",
              },
              createdAt: "2026-05-12T08:00:00.000Z",
              expirationDate: "2027-05-12T08:00:00.000Z",
              id: "permit-1",
              latestPayment: {
                id: "payment-1",
                referenceNumber: "SCN-PAY-2026-0001",
                status: "paid",
                updatedAt: "2026-05-12T09:00:00.000Z",
              },
              lineOfBusiness: "Food service",
              permitNumber: "SCN-TUG-2026-0001",
              status: "approved",
              updatedAt: "2026-05-12T08:00:00.000Z",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
      updatePermitMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
    } as never);

    renderWithProviders(<PermitBrowser />);

    expect(
      screen.getByRole("columnheader", { name: "Payment status" }),
    ).toBeInTheDocument();
    expect(screen.getByText("paid")).toBeInTheDocument();
    expect(screen.getByText("SCN-PAY-2026-0001")).toBeInTheDocument();
  });
});
