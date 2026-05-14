import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import IssueReportBrowser from "@/components/issue-report-browser";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useIssueReportBrowser } from "@/hooks/use-issue-report-browser";

vi.mock("@/hooks/use-auth-session", () => ({
  useAuthSession: vi.fn(),
}));

vi.mock("@/hooks/use-issue-report-browser", () => ({
  useIssueReportBrowser: vi.fn(),
}));

vi.mock("@/components/inspection-route-shell", () => ({
  default: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("IssueReportBrowser", () => {
  const mutate = vi.fn();

  function mockBrowserData() {
    vi.mocked(useIssueReportBrowser).mockReturnValue({
      issueReportsQuery: {
        data: {
          data: [
            {
              category: "fire_hazard",
              createdAt: "2026-05-18T09:15:00.000Z",
              description: "Open wiring near the storefront meter.",
              id: "issue-1",
              locationDescription: "Corner of Mabini and Luna",
              reportNumber: "IR-20260518-ABCD1234",
              reporterEmail: "owner@example.com",
              reporterName: "Alex Dela Cruz",
              reporterPhone: "09171234567",
              status: "submitted",
              subject: "Exposed electrical wiring",
              updatedAt: "2026-05-18T09:15:00.000Z",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
      updateIssueReportStatusMutation: {
        error: null,
        isPending: false,
        mutate,
      },
    } as never);
  }

  it("renders the issue report inbox rows", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "token",
      session: {
        user: {
          role: "admin",
        },
      },
    } as never);

    mockBrowserData();

    renderWithProviders(<IssueReportBrowser />);

    expect(screen.getByText("Issue reports")).toBeInTheDocument();
    expect(screen.getByText("IR-20260518-ABCD1234")).toBeInTheDocument();
    expect(screen.getByText("Exposed electrical wiring")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mark under review" }),
    ).toBeInTheDocument();
  });

  it("triggers issue report status updates from row actions", async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "token",
      session: {
        user: {
          role: "admin",
        },
      },
    } as never);

    mockBrowserData();

    renderWithProviders(<IssueReportBrowser />);

    await user.click(screen.getByRole("button", { name: "Mark under review" }));

    expect(mutate).toHaveBeenCalledWith({
      id: "issue-1",
      status: "under_review",
    });
  });

  it("renders an empty state when no issue reports exist", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      accessToken: "token",
      session: {
        user: {
          role: "inspector",
        },
      },
    } as never);

    vi.mocked(useIssueReportBrowser).mockReturnValue({
      issueReportsQuery: {
        data: {
          data: [],
          meta: { limit: 10, page: 1, total: 0 },
        },
        error: null,
        isLoading: false,
      },
      updateIssueReportStatusMutation: {
        error: null,
        isPending: false,
        mutate,
      },
    } as never);

    renderWithProviders(<IssueReportBrowser />);

    expect(
      screen.getByText("No issue reports found for the current filters"),
    ).toBeInTheDocument();
  });
});