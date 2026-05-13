import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useNotificationOutboxBrowser } from "@/hooks/use-notification-outbox-browser";

import NotificationOutboxBrowser from "./notification-outbox-browser";

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();

  return {
    ...actual,
    Button: ({
      children,
      disabled,
      onClick,
    }: {
      children?: ReactNode;
      disabled?: boolean;
      onClick?: () => void;
    }) => (
      <button disabled={disabled} type="button" onClick={onClick}>
        {children}
      </button>
    ),
  };
});

vi.mock("@/hooks/use-auth-session", () => ({
  useAuthSession: vi.fn(),
}));

vi.mock("@/hooks/use-notification-outbox-browser", () => ({
  useNotificationOutboxBrowser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/notifications",
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () =>
    new URLSearchParams("eventType=inspection.status_updated&status=pending"),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("NotificationOutboxBrowser", () => {
  const mutate = vi.fn();

  beforeEach(() => {
    mutate.mockReset();
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "token",
      isHydrated: true,
      loginMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
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
    vi.mocked(useNotificationOutboxBrowser).mockReturnValue({
      notificationOutboxQuery: {
        data: {
          data: [
            {
              body: "North Star Trading is now completed.",
              channel: "in_app",
              createdAt: "2026-05-13T09:00:00.000Z",
              entityId: "inspection-1",
              entityType: "inspection",
              eventType: "inspection.status_updated",
              id: "notification-1",
              recipient: {
                email: "admin@example.com",
                id: "admin-1",
                name: "System Admin",
                role: "admin",
              },
              status: "pending",
              title: "Inspection status updated: North Star Trading",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
      updateNotificationStatusMutation: {
        error: null,
        isPending: false,
        mutate,
      },
    } as unknown as ReturnType<typeof useNotificationOutboxBrowser>);
  });

  it("renders the admin notification outbox", () => {
    renderWithProviders(<NotificationOutboxBrowser />);

    expect(screen.getByText("Notifications outbox")).toBeInTheDocument();
    expect(screen.getByText("Queued deliveries")).toBeInTheDocument();
    expect(
      screen.getByText("Inspection status updated: North Star Trading"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("System Admin")[0]).toBeInTheDocument();
    expect(
      screen.getByText("Event: Inspection status updated"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "inspection-1" })).toHaveAttribute(
      "href",
      "/inspections/inspection-1",
    );
    expect(
      screen.getByRole("button", { name: "Mark processed" }),
    ).toBeInTheDocument();
  });

  it("triggers notification status updates from row actions", async () => {
    const user = userEvent.setup();

    renderWithProviders(<NotificationOutboxBrowser />);

    await user.click(screen.getByRole("button", { name: "Mark processed" }));

    expect(mutate).toHaveBeenCalledWith({
      id: "notification-1",
      status: "processed",
    });
  });

  it("shows the login prompt when no session is available", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "",
      isHydrated: true,
      loginMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      logout: vi.fn(),
      session: null,
    } as unknown as ReturnType<typeof useAuthSession>);

    renderWithProviders(<NotificationOutboxBrowser />);

    expect(screen.getByText("Dashboard session")).toBeInTheDocument();
    expect(
      screen.getByText("Inspection queries stay idle until you sign in."),
    ).toBeInTheDocument();
  });
});
