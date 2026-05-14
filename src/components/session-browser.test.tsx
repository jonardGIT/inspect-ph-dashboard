import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useSessionBrowser } from "@/hooks/use-session-browser";

import SessionBrowser from "./session-browser";

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/hooks/use-session-browser", () => ({ useSessionBrowser: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/sessions",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(""),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("SessionBrowser", () => {
  const logout = vi.fn();
  const revokeMutateAsync = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    logout.mockReset();
    revokeMutateAsync.mockClear();
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "token",
      isHydrated: true,
      loginMutation: { error: null, isPending: false, mutateAsync: vi.fn() },
      logout,
      session: {
        tokens: {
          accessToken: "token",
          expiresIn: 900,
          refreshToken: "refresh",
        },
        user: {
          createdAt: "2026-05-15T08:00:00.000Z",
          email: "admin@example.com",
          id: "admin-1",
          name: "System Admin",
          officeIds: [],
          role: "admin",
          roleProfile: {
            accessScope: "global",
            label: "BPLO Admin",
            permissions: ["inspection:read"],
          },
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);
    vi.mocked(useSessionBrowser).mockReturnValue({
      revokeSessionMutation: {
        error: null,
        isPending: false,
        mutateAsync: revokeMutateAsync,
      },
      sessionsQuery: {
        data: [
          {
            createdAt: "2026-05-15T08:00:00.000Z",
            expiresAt: "2026-05-22T08:00:00.000Z",
            id: "session-1",
            ipAddress: "127.0.0.1",
            isCurrent: true,
            lastUsedAt: "2026-05-15T08:00:00.000Z",
            user: {
              email: "admin@example.com",
              id: "admin-1",
              name: "System Admin",
              role: "admin",
            },
            userAgent: "Chrome",
          },
        ],
        error: null,
        isLoading: false,
      },
      usersQuery: {
        data: {
          data: [
            {
              createdAt: "2026-05-15T08:00:00.000Z",
              email: "admin@example.com",
              id: "admin-1",
              name: "System Admin",
              officeIds: [],
              role: "admin",
              roleProfile: {
                accessScope: "global",
                label: "BPLO Admin",
                permissions: ["inspection:read"],
              },
            },
          ],
          meta: { limit: 100, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useSessionBrowser>);
  });

  it("renders the session inventory", () => {
    renderWithProviders(<SessionBrowser />);

    expect(screen.getByText("Sessions")).toBeInTheDocument();
    expect(screen.getByText("Active sessions")).toBeInTheDocument();
    expect(screen.getByText("session-1")).toBeInTheDocument();
    expect(screen.getByText("current")).toBeInTheDocument();
  });

  it("logs out after revoking the current session", async () => {
    const user = userEvent.setup();

    renderWithProviders(<SessionBrowser />);

    await user.click(screen.getByRole("button", { name: "Revoke" }));

    expect(revokeMutateAsync).toHaveBeenCalledWith({ sessionId: "session-1" });
    expect(logout).toHaveBeenCalled();
  });
});
