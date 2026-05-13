import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useLguBrowser } from "@/hooks/use-lgu-browser";

import LguBrowser from "./lgu-browser";

vi.mock("@/hooks/use-auth-session", () => ({
  useAuthSession: vi.fn(),
}));

vi.mock("@/hooks/use-lgu-browser", () => ({
  useLguBrowser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/lgus",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("search=tuguegarao"),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("LguBrowser", () => {
  beforeEach(() => {
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
          createdAt: "2026-05-13T08:00:00.000Z",
          email: "admin@example.com",
          id: "admin-1",
          name: "System Admin",
          role: "admin",
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);
    vi.mocked(useLguBrowser).mockReturnValue({
      createLguMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      lgusQuery: {
        data: {
          data: [
            {
              city: "Tuguegarao City",
              code: "TUG-01",
              createdAt: "2026-05-13T09:00:00.000Z",
              id: "lgu-1",
              name: "Tuguegarao City LGU",
              province: "Cagayan",
              region: "Region II",
              updatedAt: "2026-05-13T09:00:00.000Z",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useLguBrowser>);
  });

  it("renders the LGU registry and active filter", () => {
    renderWithProviders(<LguBrowser />);

    expect(screen.getByText("LGUs")).toBeInTheDocument();
    expect(screen.getByText("LGU registry")).toBeInTheDocument();
    expect(screen.getByText("Tuguegarao City LGU")).toBeInTheDocument();
    expect(screen.getByText("Search: tuguegarao")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register LGU" }),
    ).toBeInTheDocument();
  });
});
