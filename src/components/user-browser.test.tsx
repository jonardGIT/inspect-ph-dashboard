import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useUserBrowser } from "@/hooks/use-user-browser";

import UserBrowser from "./user-browser";

vi.mock("@/hooks/use-auth-session", () => ({
  useAuthSession: vi.fn(),
}));

vi.mock("@/hooks/use-user-browser", () => ({
  useUserBrowser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/users",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("role=inspector&userId=user-2"),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("UserBrowser", () => {
  const createMutate = vi.fn();
  const deleteMutate = vi.fn();

  beforeEach(() => {
    createMutate.mockReset();
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
          createdAt: "2026-05-13T08:00:00.000Z",
          email: "admin@example.com",
          id: "admin-1",
          name: "System Admin",
          role: "admin",
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);
    vi.mocked(useUserBrowser).mockReturnValue({
      assignmentsQuery: {
        data: [
          {
            createdAt: "2026-05-13T09:00:00.000Z",
            id: "assignment-1",
            office: {
              code: "BPLO-HQ",
              id: "office-1",
              lguId: "lgu-1",
              name: "BPLO Headquarters",
            },
            user: {
              email: "inspector@example.com",
              id: "user-2",
              name: "Field Inspector",
              role: "inspector",
            },
          },
        ],
        error: null,
        isLoading: false,
      },
      createAssignmentMutation: {
        error: null,
        isPending: false,
        mutate: createMutate,
      },
      deleteAssignmentMutation: {
        error: null,
        isPending: false,
        mutate: deleteMutate,
      },
      officesQuery: {
        data: {
          data: [
            {
              code: "BPLO-HQ",
              createdAt: "2026-05-13T09:00:00.000Z",
              description: "Primary permit office",
              id: "office-1",
              lguId: "lgu-1",
              name: "BPLO Headquarters",
              updatedAt: "2026-05-13T09:00:00.000Z",
            },
          ],
          meta: { limit: 100, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
      usersQuery: {
        data: {
          data: [
            {
              createdAt: "2026-05-13T08:00:00.000Z",
              email: "inspector@example.com",
              id: "user-2",
              name: "Field Inspector",
              role: "inspector",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useUserBrowser>);
  });

  it("renders the user directory and selected assignment state", () => {
    renderWithProviders(<UserBrowser />);

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("User directory")).toBeInTheDocument();
    expect(screen.getByText("Field Inspector")).toBeInTheDocument();
    expect(screen.getByText("Role: Inspector")).toBeInTheDocument();
    expect(screen.getByText("BPLO Headquarters · BPLO-HQ")).toBeInTheDocument();
  });

  it("removes an assignment from the selected user", async () => {
    const user = userEvent.setup();

    renderWithProviders(<UserBrowser />);

    await user.click(screen.getByRole("button", { name: "Remove assignment" }));

    expect(deleteMutate).toHaveBeenCalledWith({
      assignmentId: "assignment-1",
      userId: "user-2",
    });
  });
});
