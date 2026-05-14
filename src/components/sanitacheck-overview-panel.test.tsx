import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import SanitaCheckOverviewPanel from "@/components/sanitacheck-overview-panel";
import { useInspectionBrowser } from "@/hooks/use-inspection-browser";

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

describe("SanitaCheckOverviewPanel", () => {
  it("renders a scoped sanitation snapshot", () => {
    vi.mocked(useInspectionBrowser).mockReturnValue({
      createInspectionMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      inspectionsQuery: {
        data: {
          data: [
            {
              business: { businessName: "Golden Spoon Eatery", id: "biz-1" },
              completedAt: undefined,
              createdAt: "2026-05-20T08:30:00.000Z",
              id: "inspection-1",
              inspectorId: "inspector-1",
              location: { latitude: 17.6138, longitude: 121.7244 },
              notes: "Routine sanitation walkthrough",
              office: {
                code: "SAN-HQ",
                id: "office-sanita",
                lguId: "lgu-1",
                name: "Sanitation Services Headquarters",
              },
              permit: { id: "permit-1", permitNumber: "SAN-DEV-2026-0001" },
              scheduledAt: "2026-05-22T10:00:00.000Z",
              startedAt: undefined,
              status: "scheduled",
              updatedAt: "2026-05-20T08:30:00.000Z",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
      mapPointsQuery: {
        data: [],
        error: null,
        isLoading: false,
      },
      summaryQuery: {
        data: {
          canceled: 0,
          completed: 1,
          inProgress: 0,
          overdue: 0,
          scheduled: 1,
          total: 2,
        },
        error: null,
      },
    } as unknown as ReturnType<typeof useInspectionBrowser>);

    renderWithProviders(
      <SanitaCheckOverviewPanel
        accessToken="token"
        officeId="office-sanita"
        officeLabel="Sanitation Services Headquarters · SAN-HQ"
      />,
    );

    expect(
      screen.getByText("Sanitation operations snapshot"),
    ).toBeInTheDocument();
    expect(screen.getByText("Scheduled 1")).toBeInTheDocument();
    expect(screen.getByText("Golden Spoon Eatery")).toBeInTheDocument();
    expect(screen.getByText("Open inspection workspace")).toBeInTheDocument();
  });

  it("renders an empty state when no sanitation inspections are available", () => {
    vi.mocked(useInspectionBrowser).mockReturnValue({
      createInspectionMutation: {
        error: null,
        isPending: false,
        mutateAsync: vi.fn(),
      },
      inspectionsQuery: {
        data: {
          data: [],
          meta: { limit: 10, page: 1, total: 0 },
        },
        error: null,
        isLoading: false,
      },
      mapPointsQuery: {
        data: [],
        error: null,
        isLoading: false,
      },
      summaryQuery: {
        data: {
          canceled: 0,
          completed: 0,
          inProgress: 0,
          overdue: 0,
          scheduled: 0,
          total: 0,
        },
        error: null,
      },
    } as unknown as ReturnType<typeof useInspectionBrowser>);

    renderWithProviders(
      <SanitaCheckOverviewPanel
        accessToken="token"
        officeId="office-sanita"
        officeLabel="Sanitation Services Headquarters · SAN-HQ"
      />,
    );

    expect(
      screen.getByText("No SanitaCheck inspections found for this office yet"),
    ).toBeInTheDocument();
  });
});
