import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import BuildSureBrowser from "@/components/buildsure-browser";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/hooks/use-module-workspace", () => ({
  useModuleWorkspace: vi.fn(),
}));
vi.mock("@/components/inspection-browser", () => ({
  default: vi.fn((props: Record<string, string>) => (
    <div>
      <div>InspectionBrowserStub</div>
      <div>{props.title}</div>
      <div>{props.lockedOfficeId}</div>
      <div>{props.lockedOfficeLabel}</div>
      <div>{props.beforeContent ? "HasBeforeContent" : "NoBeforeContent"}</div>
    </div>
  )),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("BuildSureBrowser", () => {
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
          email: "inspector@example.com",
          id: "inspector-1",
          name: "Field Inspector",
          officeIds: ["office-build"],
          role: "inspector",
          roleProfile: {
            accessScope: "assigned",
            label: "Field Inspector",
            permissions: ["inspection:read"],
          },
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);

    vi.mocked(useModuleWorkspace).mockReturnValue({
      moduleQuery: {
        data: {
          code: "BUILD",
          createdAt: "2026-05-14T08:00:00.000Z",
          id: "module-build",
          isActive: true,
          name: "BuildSure PH",
          updatedAt: "2026-05-14T08:00:00.000Z",
        },
        error: null,
        isLoading: false,
      },
      officeModulesQuery: {
        data: {
          data: [
            {
              createdAt: "2026-05-14T08:00:00.000Z",
              id: "assignment-1",
              module: {
                code: "BUILD",
                id: "module-build",
                isActive: true,
                name: "BuildSure PH",
              },
              office: {
                code: "BLD-HQ",
                id: "office-build",
                lguId: "lgu-1",
                name: "Building Safety Headquarters",
              },
            },
          ],
          meta: { limit: 100, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useModuleWorkspace>);
  });

  it("locks the inspection browser to the BuildSure office", () => {
    renderWithProviders(<BuildSureBrowser />);

    expect(screen.getByText("InspectionBrowserStub")).toBeInTheDocument();
    expect(screen.getByText("BuildSure PH")).toBeInTheDocument();
    expect(screen.getByText("office-build")).toBeInTheDocument();
    expect(
      screen.getByText("Building Safety Headquarters · BLD-HQ"),
    ).toBeInTheDocument();
    expect(screen.getByText("NoBeforeContent")).toBeInTheDocument();
  });
});
