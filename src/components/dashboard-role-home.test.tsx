import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import DashboardRoleHome from "@/components/dashboard-role-home";
import { useAuthSession } from "@/hooks/use-auth-session";

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/components/public-fire-safety-certificate-lookup", () => ({
  default: () => <div>Public cert lookup</div>,
}));
vi.mock("@/components/public-issue-report-form", () => ({
  default: () => <div>Public issue form</div>,
}));
vi.mock("@/components/public-issue-report-lookup", () => ({
  default: () => <div>Public issue lookup</div>,
}));
vi.mock("@/components/public-payment-lookup", () => ({
  default: () => <div>Public payment lookup</div>,
}));
vi.mock("@/components/public-permit-lookup", () => ({
  default: () => <div>Public permit lookup</div>,
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("DashboardRoleHome", () => {
  it("shows public landing content when there is no session", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "",
      isHydrated: true,
      loginMutation: { error: null, isPending: false, mutateAsync: vi.fn() },
      logout: vi.fn(),
      session: null,
      user: null,
    } as unknown as ReturnType<typeof useAuthSession>);

    renderWithProviders(<DashboardRoleHome />);

    expect(screen.getByText("Inspect PH Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Public cert lookup")).toBeInTheDocument();
  });

  it("shows the mobile-first message for business owners", () => {
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
          email: "owner@example.com",
          id: "owner-1",
          name: "Owner",
          officeIds: [],
          role: "business_owner",
          roleProfile: {
            accessScope: "own",
            label: "Business Owner",
            permissions: [],
          },
        },
      },
      user: null,
    } as unknown as ReturnType<typeof useAuthSession>);

    renderWithProviders(<DashboardRoleHome />);

    expect(
      screen.getByText("Use mobile for owner self-service"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Platform administration"),
    ).not.toBeInTheDocument();
  });

  it("shows role-specific cards for office clerks", () => {
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
            permissions: [],
          },
        },
      },
      user: null,
    } as unknown as ReturnType<typeof useAuthSession>);

    renderWithProviders(<DashboardRoleHome />);

    expect(screen.getByText("Business intake")).toBeInTheDocument();
    expect(screen.getByText("Permit intake")).toBeInTheDocument();
    expect(screen.getByText("Inspection preparation")).toBeInTheDocument();
  });
});
