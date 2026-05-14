import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleBrowser } from "@/hooks/use-module-browser";

import ModuleBrowser from "./module-browser";

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/hooks/use-module-browser", () => ({ useModuleBrowser: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/modules",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("status=active"),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("ModuleBrowser", () => {
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
          createdAt: "2026-05-14T08:00:00.000Z",
          email: "admin@example.com",
          id: "admin-1",
          name: "System Admin",
          role: "admin",
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);
    vi.mocked(useModuleBrowser).mockReturnValue({
      createModuleMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      modulesQuery: {
        data: {
          data: [
            {
              code: "BPLO",
              createdAt: "2026-05-14T09:00:00.000Z",
              description: "Business permit and licensing operations",
              id: "module-1",
              isActive: true,
              name: "BPLO Inspection",
              updatedAt: "2026-05-14T09:00:00.000Z",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useModuleBrowser>);
  });

  it("renders the module registry", () => {
    renderWithProviders(<ModuleBrowser />);

    expect(screen.getByText("Modules")).toBeInTheDocument();
    expect(screen.getByText("Module registry")).toBeInTheDocument();
    expect(screen.getByText("BPLO Inspection")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register module" }),
    ).toBeInTheDocument();
  });
});
