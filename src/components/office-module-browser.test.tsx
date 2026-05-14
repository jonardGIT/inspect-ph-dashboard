import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useOfficeModuleBrowser } from "@/hooks/use-office-module-browser";

import OfficeModuleBrowser from "./office-module-browser";

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/hooks/use-office-module-browser", () => ({
  useOfficeModuleBrowser: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/office-modules",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("officeId=office-1"),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("OfficeModuleBrowser", () => {
  const deleteMutate = vi.fn();

  beforeEach(() => {
    deleteMutate.mockReset();
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
    vi.mocked(useOfficeModuleBrowser).mockReturnValue({
      createOfficeModuleMutation: {
        error: null,
        isPending: false,
        mutate: vi.fn(),
      },
      deleteOfficeModuleMutation: {
        error: null,
        isPending: false,
        mutate: deleteMutate,
      },
      modulesQuery: {
        data: {
          data: [
            {
              code: "BPLO",
              createdAt: "",
              id: "module-1",
              isActive: true,
              name: "BPLO Inspection",
              updatedAt: "",
            },
          ],
          meta: { limit: 100, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
      officeModulesQuery: {
        data: {
          data: [
            {
              createdAt: "2026-05-14T09:00:00.000Z",
              id: "assignment-1",
              module: {
                code: "BPLO",
                id: "module-1",
                isActive: true,
                name: "BPLO Inspection",
              },
              office: {
                code: "BPLO-HQ",
                id: "office-1",
                lguId: "lgu-1",
                name: "BPLO Headquarters",
              },
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
      officesQuery: {
        data: {
          data: [
            {
              code: "BPLO-HQ",
              createdAt: "",
              id: "office-1",
              lguId: "lgu-1",
              name: "BPLO Headquarters",
              updatedAt: "",
            },
          ],
          meta: { limit: 100, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useOfficeModuleBrowser>);
  });

  it("renders the office module matrix", () => {
    renderWithProviders(<OfficeModuleBrowser />);

    expect(screen.getByText("Office modules")).toBeInTheDocument();
    expect(screen.getByText("Office module matrix")).toBeInTheDocument();
    expect(screen.getByText("BPLO Headquarters · BPLO-HQ")).toBeInTheDocument();
    expect(screen.getByText("BPLO Inspection")).toBeInTheDocument();
  });

  it("removes an office module assignment", async () => {
    const user = userEvent.setup();

    renderWithProviders(<OfficeModuleBrowser />);

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(deleteMutate).toHaveBeenCalledWith({ assignmentId: "assignment-1" });
  });
});
