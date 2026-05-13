import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useAuditLogBrowser } from "@/hooks/use-audit-log-browser";

import AuditLogBrowser from "./audit-log-browser";

vi.mock("@/hooks/use-auth-session", () => ({
  useAuthSession: vi.fn(),
}));

vi.mock("@/hooks/use-audit-log-browser", () => ({
  useAuditLogBrowser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/audit-logs",
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () =>
    new URLSearchParams("action=inspection.created&entityType=inspection"),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("AuditLogBrowser", () => {
  beforeEach(() => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "token",
      isHydrated: true,
      loginMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      logout: vi.fn(),
      session: {
        tokens: {
          accessToken: "token",
          expiresIn: 900,
          refreshToken: "refresh",
        },
        user: {
          createdAt: "2026-05-13T08:00:00.000Z",
          email: "admin@example.com",
          id: "admin-1",
          name: "System Admin",
          role: "admin",
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);
    vi.mocked(useAuditLogBrowser).mockReturnValue({
      auditLogsQuery: {
        data: {
          data: [
            {
              action: "inspection.created",
              actor: {
                email: "admin@example.com",
                id: "admin-1",
                name: "System Admin",
                role: "admin",
              },
              createdAt: "2026-05-13T09:00:00.000Z",
              detail: "Assigned to inspector inspector-1",
              entityId: "inspection-1",
              entityType: "inspection",
              id: "audit-1",
              summary: "Scheduled inspection for Acme Foods",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useAuditLogBrowser>);
  });

  it("renders the admin audit activity stream", () => {
    renderWithProviders(<AuditLogBrowser />);

    expect(screen.getByText("Audit log")).toBeInTheDocument();
    expect(screen.getByText("Activity stream")).toBeInTheDocument();
    expect(
      screen.getByText("Scheduled inspection for Acme Foods"),
    ).toBeInTheDocument();
    expect(screen.getByText("System Admin")).toBeInTheDocument();
    expect(screen.getByText("Action: Inspection created")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "inspection-1" })).toHaveAttribute(
      "href",
      "/inspections/inspection-1",
    );
    expect(
      screen.getByPlaceholderText(
        "Search summary, detail, actor, or entity ID",
      ),
    ).toBeInTheDocument();
  });

  it("shows the login prompt when no session is available", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "",
      isHydrated: true,
      loginMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      logout: vi.fn(),
      session: null,
    } as unknown as ReturnType<typeof useAuthSession>);

    renderWithProviders(<AuditLogBrowser />);

    expect(screen.getByText("Dashboard session")).toBeInTheDocument();
    expect(
      screen.getByText("Inspection queries stay idle until you sign in."),
    ).toBeInTheDocument();
  });
});
