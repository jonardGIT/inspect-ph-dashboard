import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useOfficeBrowser } from "@/hooks/use-office-browser";

import OfficeBrowser from "./office-browser";

vi.mock("@/hooks/use-auth-session", () => ({
  useAuthSession: vi.fn(),
}));

vi.mock("@/hooks/use-office-browser", () => ({
  useOfficeBrowser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/offices",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("search=headquarters&lguId=lgu-1"),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("OfficeBrowser", () => {
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
    vi.mocked(useOfficeBrowser).mockReturnValue({
      createOfficeMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      lguOptionsQuery: {
        data: {
          data: [
            {
              code: "TUG-01",
              createdAt: "2026-05-13T09:00:00.000Z",
              id: "lgu-1",
              name: "Tuguegarao City LGU",
              updatedAt: "2026-05-13T09:00:00.000Z",
            },
          ],
          meta: { limit: 100, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
      officesQuery: {
        data: {
          data: [
            {
              code: "BPLO-HQ",
              createdAt: "2026-05-13T09:00:00.000Z",
              description: "Primary permit and inspection office",
              id: "office-1",
              lguId: "lgu-1",
              name: "BPLO Headquarters",
              updatedAt: "2026-05-13T09:00:00.000Z",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useOfficeBrowser>);
  });

  it("renders the office registry and LGU filter state", () => {
    renderWithProviders(<OfficeBrowser />);

    expect(screen.getByText("Offices")).toBeInTheDocument();
    expect(screen.getByText("Office registry")).toBeInTheDocument();
    expect(screen.getByText("BPLO Headquarters")).toBeInTheDocument();
    expect(screen.getByText("Search: headquarters")).toBeInTheDocument();
    expect(screen.getByText("LGU: Tuguegarao City LGU")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register office" }),
    ).toBeInTheDocument();
  });
});
