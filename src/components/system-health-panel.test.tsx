import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SystemHealthPanel from "@/components/system-health-panel";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useInspectionBrowser } from "@/hooks/use-inspection-browser";
import { useSystemHealth } from "@/hooks/use-system-health";

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/hooks/use-system-health", () => ({ useSystemHealth: vi.fn() }));
vi.mock("@/hooks/use-inspection-browser", () => ({
  useInspectionBrowser: vi.fn(),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

const baseSummary = {
  total: 42,
  scheduled: 10,
  inProgress: 8,
  completed: 20,
  overdue: 4,
  canceled: 0,
};

describe("SystemHealthPanel", () => {
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
          name: "Platform Admin",
          officeIds: [],
          role: "admin",
          roleProfile: {
            accessScope: "global",
            label: "Platform Admin",
            permissions: ["report:read"],
          },
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);

    vi.mocked(useSystemHealth).mockReturnValue({
      data: { db: "ok", status: "healthy" },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useSystemHealth>);

    vi.mocked(useInspectionBrowser).mockReturnValue({
      summaryQuery: { data: baseSummary, error: null, isLoading: false },
      byOfficeQuery: { data: [], error: null, isLoading: false },
      listQuery: { data: undefined, error: null, isLoading: false },
      mapQuery: { data: undefined, error: null, isLoading: false },
      assignInspectionMutation: { mutate: vi.fn(), isPending: false },
      createInspectionMutation: { mutate: vi.fn(), isPending: false },
      updateStatusMutation: { mutate: vi.fn(), isPending: false },
    } as unknown as ReturnType<typeof useInspectionBrowser>);
  });

  it("shows Healthy status when API and DB are up", () => {
    renderWithProviders(<SystemHealthPanel />);

    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByText("System health")).toBeInTheDocument();
  });

  it("shows Degraded status when API returns an error", () => {
    vi.mocked(useSystemHealth).mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    } as unknown as ReturnType<typeof useSystemHealth>);

    renderWithProviders(<SystemHealthPanel />);

    expect(screen.getByText("Degraded")).toBeInTheDocument();
    expect(
      screen.getByText(/Could not reach the API server/),
    ).toBeInTheDocument();
  });

  it("shows DB disconnected when health returns db: error", () => {
    vi.mocked(useSystemHealth).mockReturnValue({
      data: { db: "error", status: "degraded" },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useSystemHealth>);

    renderWithProviders(<SystemHealthPanel />);

    expect(screen.getByText("Degraded")).toBeInTheDocument();
    expect(screen.getByText("Disconnected")).toBeInTheDocument();
  });

  it("renders workload snapshot metrics", () => {
    renderWithProviders(<SystemHealthPanel />);

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });
});
