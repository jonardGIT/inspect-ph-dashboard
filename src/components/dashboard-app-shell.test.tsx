import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardAppShell, {
  isProtectedDashboardPath,
} from "@/components/dashboard-app-shell";
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

    expect(screen.getByText("BuildSure")).toBeInTheDocument();
    expect(screen.getByText("Inspections")).toBeInTheDocument();
    expect(screen.getByText("MarketGuard")).toBeInTheDocument();
    expect(screen.getByText("SanitaCheck")).toBeInTheDocument();
    expect(screen.getByText("Owner support")).toBeInTheDocument();
    expect(screen.queryByText("Payments")).not.toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Modules")).not.toBeInTheDocument();
  });

  it("treats support as a protected dashboard route", () => {
    expect(isProtectedDashboardPath("/support")).toBe(true);
  });

  it("treats payments as a protected dashboard route", () => {
    expect(isProtectedDashboardPath("/payments")).toBe(true);
  });

  it("treats sanitacheck as a protected dashboard route", () => {
    expect(isProtectedDashboardPath("/sanitacheck")).toBe(true);
  });

  it("treats marketguard as a protected dashboard route", () => {
    expect(isProtectedDashboardPath("/marketguard")).toBe(true);
  });

  it("treats buildsure as a protected dashboard route", () => {
    expect(isProtectedDashboardPath("/buildsure")).toBe(true);
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
