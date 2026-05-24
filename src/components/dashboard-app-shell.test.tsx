import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardAppShell, {
  isProtectedDashboardPath,
} from "@/components/dashboard-app-shell";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useCommandPalette } from "@/hooks/use-command-palette";

const push = vi.fn();
let pathname = "/inspections";

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();

  const LayoutRoot = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  const LayoutSection = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  const MockMenu = ({
    items,
  }: {
    items?: Array<{ label?: ReactNode; key?: string }>;
  }) => (
    <nav>
      {items?.map((item) => (
        <div key={String(item.key)}>{item.label}</div>
      ))}
    </nav>
  );

  return {
    ...actual,
    Layout: Object.assign(LayoutRoot, {
      Content: LayoutSection,
      Header: LayoutSection,
      Sider: LayoutSection,
    }),
    Menu: MockMenu,
  };
});

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/hooks/use-command-palette", () => ({
  useCommandPalette: vi.fn(),
}));
vi.mock("@/components/command-palette", () => ({
  default: () => null,
}));
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
    vi.mocked(useCommandPalette).mockReturnValue({
      closePalette: vi.fn(),
      open: false,
      openPalette: vi.fn(),
    } as never);
  });

  it("limits inspector navigation to dashboard-secondary routes", () => {
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
    expect(screen.getByText("Inspector Calendar")).toBeInTheDocument();
    expect(screen.queryByText("BuildSure")).not.toBeInTheDocument();
    expect(screen.queryByText("MarketGuard")).not.toBeInTheDocument();
    expect(screen.queryByText("SanitaCheck")).not.toBeInTheDocument();
    expect(screen.queryByText("Owner support")).not.toBeInTheDocument();
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

    expect(screen.getByText("Dashboard access limited")).toBeInTheDocument();
    expect(screen.queryByText("Hidden admin content")).not.toBeInTheDocument();
  });

  it("blocks business owners from protected dashboard routes", () => {
    pathname = "/permits";
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
          name: "Business Owner",
          role: "business_owner",
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);

    renderWithProviders(
      <DashboardAppShell>
        <div>Owner protected content</div>
      </DashboardAppShell>,
    );

    expect(screen.getByText("Use the mobile app")).toBeInTheDocument();
    expect(
      screen.queryByText("Owner protected content"),
    ).not.toBeInTheDocument();
  });
});
