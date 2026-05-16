import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ChecklistTemplateBrowser from "@/components/checklist-template-browser";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useChecklistTemplateBrowser } from "@/hooks/use-checklist-template-browser";

vi.mock("@/hooks/use-auth-session", () => ({ useAuthSession: vi.fn() }));
vi.mock("@/hooks/use-checklist-template-browser", () => ({
  useChecklistTemplateBrowser: vi.fn(),
}));
vi.mock("@/hooks/use-browser-query-params", () => ({
  useBrowserQueryParams: vi.fn(() => ({
    activeCount: 0,
    clearValues: vi.fn(),
    page: 1,
    setPage: vi.fn(),
    setValue: vi.fn(),
    values: { module: "", search: "", status: "all" },
  })),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

const baseTemplate = {
  code: "BPLO-001",
  createdAt: "2026-05-14T08:00:00.000Z",
  description: "Basic checklist for BPLO permits",
  id: "template-1",
  isActive: true,
  items: [],
  module: "BPLO",
  sortOrder: 1,
  title: "Basic Business Permit Checklist",
  updatedAt: "2026-05-14T08:00:00.000Z",
};

describe("ChecklistTemplateBrowser", () => {
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
            permissions: ["module:manage", "inspection:read"],
          },
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);

    vi.mocked(useChecklistTemplateBrowser).mockReturnValue({
      createMutation: { isPending: false, mutateAsync: vi.fn() },
      setActiveMutation: { isPending: false, mutate: vi.fn() },
      templatesQuery: {
        data: {
          data: [baseTemplate],
          meta: { limit: 20, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useChecklistTemplateBrowser>);
  });

  it("renders the template list with code and title", () => {
    renderWithProviders(<ChecklistTemplateBrowser />);

    expect(screen.getByText("BPLO-001")).toBeInTheDocument();
    expect(
      screen.getByText("Basic Business Permit Checklist"),
    ).toBeInTheDocument();
  });

  it("shows loading state while templates are fetching", () => {
    vi.mocked(useChecklistTemplateBrowser).mockReturnValue({
      createMutation: { isPending: false, mutateAsync: vi.fn() },
      setActiveMutation: { isPending: false, mutate: vi.fn() },
      templatesQuery: {
        data: undefined,
        error: null,
        isLoading: true,
      },
    } as unknown as ReturnType<typeof useChecklistTemplateBrowser>);

    renderWithProviders(<ChecklistTemplateBrowser />);

    expect(screen.queryByText("BPLO-001")).not.toBeInTheDocument();
  });

  it("shows empty state when no templates exist", () => {
    vi.mocked(useChecklistTemplateBrowser).mockReturnValue({
      createMutation: { isPending: false, mutateAsync: vi.fn() },
      setActiveMutation: { isPending: false, mutate: vi.fn() },
      templatesQuery: {
        data: { data: [], meta: { limit: 20, page: 1, total: 0 } },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useChecklistTemplateBrowser>);

    renderWithProviders(<ChecklistTemplateBrowser />);

    expect(screen.queryByText("BPLO-001")).not.toBeInTheDocument();
  });
});
