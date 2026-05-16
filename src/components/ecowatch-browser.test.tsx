import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EcoWatchBrowser from "@/components/ecowatch-browser";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModuleWorkspace } from "@/hooks/use-module-workspace";

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/hooks/use-module-workspace", () => ({
  useModuleWorkspace: vi.fn(),
}));
vi.mock("@/components/inspection-browser", () => ({
  default: vi.fn((props: Record<string, unknown>) => (
    <div>
      <div>InspectionBrowserStub</div>
      <div>{props.title as string}</div>
      <div>{props.lockedOfficeId as string}</div>
      <div>{props.lockedOfficeLabel as string}</div>
      <div>{props.beforeContent ? "HasBeforeContent" : "NoBeforeContent"}</div>
    </div>
  )),
}));
vi.mock("@/components/ecowatch-overview-panel", () => ({
  default: vi.fn(() => <div>EcoWatchOverviewPanelStub</div>),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

const baseModuleData = {
  moduleQuery: {
    data: {
      code: "ECOWATCH",
      createdAt: "2026-05-14T08:00:00.000Z",
      id: "module-ecowatch",
      isActive: true,
      name: "EcoWatch LGU",
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
            code: "ECOWATCH",
            id: "module-ecowatch",
            isActive: true,
            name: "EcoWatch LGU",
          },
          office: {
            code: "ECO-HQ",
            id: "office-ecowatch",
            lguId: "lgu-1",
            name: "Environment Office",
          },
        },
      ],
      meta: { limit: 100, page: 1, total: 1 },
    },
    error: null,
    isLoading: false,
  },
};

describe("EcoWatchBrowser", () => {
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
          officeIds: ["office-ecowatch"],
          role: "inspector",
          roleProfile: {
            accessScope: "assigned",
            label: "Field Inspector",
            permissions: ["inspection:read"],
          },
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);

    vi.mocked(useModuleWorkspace).mockReturnValue(
      baseModuleData as unknown as ReturnType<typeof useModuleWorkspace>,
    );
  });

  it("locks the inspection browser to the EcoWatch office", () => {
    renderWithProviders(<EcoWatchBrowser />);

    expect(screen.getByText("InspectionBrowserStub")).toBeInTheDocument();
    expect(screen.getByText("EcoWatch LGU")).toBeInTheDocument();
    expect(screen.getByText("office-ecowatch")).toBeInTheDocument();
    expect(screen.getByText("Environment Office · ECO-HQ")).toBeInTheDocument();
    expect(screen.getByText("HasBeforeContent")).toBeInTheDocument();
  });

  it("shows a loading spinner while module data is loading", () => {
    vi.mocked(useModuleWorkspace).mockReturnValue({
      moduleQuery: { data: undefined, error: null, isLoading: true },
      officeModulesQuery: { data: undefined, error: null, isLoading: true },
    } as unknown as ReturnType<typeof useModuleWorkspace>);

    renderWithProviders(<EcoWatchBrowser />);

    expect(screen.queryByText("InspectionBrowserStub")).not.toBeInTheDocument();
  });

  it("shows an empty state when no office is assigned", () => {
    vi.mocked(useModuleWorkspace).mockReturnValue({
      moduleQuery: {
        data: {
          code: "ECOWATCH",
          id: "module-ecowatch",
          isActive: true,
          name: "EcoWatch LGU",
        },
        error: null,
        isLoading: false,
      },
      officeModulesQuery: {
        data: { data: [], meta: { limit: 100, page: 1, total: 0 } },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useModuleWorkspace>);

    renderWithProviders(<EcoWatchBrowser />);

    expect(
      screen.getByText("No EcoWatch office assignments found yet"),
    ).toBeInTheDocument();
  });
});
