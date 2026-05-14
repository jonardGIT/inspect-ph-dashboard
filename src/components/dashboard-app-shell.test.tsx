import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardAppShell from "@/components/dashboard-app-shell";
import { useAuthSession } from "@/hooks/use-auth-session";

const push = vi.fn();
let pathname = "/inspections";

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push }),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("DashboardAppShell", () => {
  beforeEach(() => {
    pathname = "/inspections";
    push.mockReset();
  });

  it("hides admin-only navigation for inspectors", () => {
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
          email: "inspector@example.com",
          id: "inspector-1",
          name: "Field Inspector",
          role: "inspector",
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);

    renderWithProviders(
      <DashboardAppShell>
        <div>Inspector content</div>
      </DashboardAppShell>,
    );

    expect(screen.getByText("Inspections")).toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Modules")).not.toBeInTheDocument();
  });

  it("blocks inspectors from direct admin routes", () => {
    pathname = "/users";
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
          email: "inspector@example.com",
          id: "inspector-1",
          name: "Field Inspector",
          role: "inspector",
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);

    renderWithProviders(
      <DashboardAppShell>
        <div>Hidden admin content</div>
      </DashboardAppShell>,
    );

    expect(screen.getByText("Admin access required")).toBeInTheDocument();
    expect(screen.queryByText("Hidden admin content")).not.toBeInTheDocument();
  });
});
