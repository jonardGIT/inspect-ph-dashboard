import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useInspectionTwinReport } from "@/hooks/use-inspection-twin-report";

import InspectionTwinSimulator from "./inspection-twin-simulator";

vi.mock("@/hooks/use-inspection-twin-report", () => ({
  useInspectionTwinReport: vi.fn(),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("InspectionTwinSimulator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders simulation metrics and impacted inspections", () => {
    vi.mocked(useInspectionTwinReport).mockReturnValue({
      modulesQuery: {
        data: {
          data: [
            {
              code: "FIRE",
              createdAt: "2026-05-14T09:00:00.000Z",
              description: "Fire safety inspections",
              id: "module-1",
              isActive: true,
              name: "FireGuard",
              updatedAt: "2026-05-14T09:00:00.000Z",
            },
          ],
          meta: { limit: 100, page: 1, total: 1 },
        },
        isLoading: false,
      },
      reportQuery: {
        data: {
          affectedBusinesses: 1,
          config: {
            failOnCriticalSeverity: true,
            failOnHighSeverity: false,
            fromDate: "2026-03-01T00:00:00.000Z",
            maxFailedChecklistItems: 0,
            minChecklistPassRatePct: 80,
            moduleCode: "FIRE",
            toDate: "2026-03-31T23:59:59.999Z",
          },
          failureRatePct: 100,
          inspectionsEvaluated: 1,
          period: {
            from: "2026-03-01T00:00:00.000Z",
            to: "2026-03-31T23:59:59.999Z",
          },
          records: [
            {
              businessId: "business-1",
              businessName: "North Star Trading",
              checklistPassRatePct: 50,
              completedAt: "2026-03-18T11:30:00.000Z",
              criticalFindings: 1,
              failedChecklistItems: 1,
              highFindings: 0,
              inspectionId: "inspection-1",
              moduleCode: "FIRE",
              officeCode: "FIRE-01",
              officeId: "office-1",
              officeName: "Fire Safety Office",
              permitNumber: "FSIC-2026-001",
              reasons: ["Contains CRITICAL severity findings"],
              scheduledAt: "2026-01-05T08:00:00.000Z",
              simulatedOutcome: "fail",
              totalChecklistItems: 2,
            },
          ],
          simulatedFailedCount: 1,
          simulatedPassCount: 0,
          topReasons: [
            {
              count: 1,
              reason: "Contains CRITICAL severity findings",
            },
          ],
        },
        error: null,
        isError: false,
        isLoading: false,
      },
    } as never);

    renderWithProviders(<InspectionTwinSimulator />);

    expect(screen.getByText("Inspection Twin Simulator")).toBeInTheDocument();
    expect(screen.getByText("Inspections evaluated")).toBeInTheDocument();
    expect(screen.getByText("North Star Trading")).toBeInTheDocument();
    expect(screen.getByText("FSIC-2026-001")).toBeInTheDocument();
    expect(
      screen.getAllByText("Contains CRITICAL severity findings").length,
    ).toBeGreaterThan(0);
  });

  it("shows empty states when nothing would fail", () => {
    vi.mocked(useInspectionTwinReport).mockReturnValue({
      modulesQuery: {
        data: { data: [], meta: { limit: 100, page: 1, total: 0 } },
        isLoading: false,
      },
      reportQuery: {
        data: {
          affectedBusinesses: 0,
          config: {
            failOnCriticalSeverity: true,
            failOnHighSeverity: false,
            fromDate: "2026-03-01T00:00:00.000Z",
            maxFailedChecklistItems: 2,
            minChecklistPassRatePct: 75,
            toDate: "2026-03-31T23:59:59.999Z",
          },
          failureRatePct: 0,
          inspectionsEvaluated: 1,
          period: {
            from: "2026-03-01T00:00:00.000Z",
            to: "2026-03-31T23:59:59.999Z",
          },
          records: [
            {
              businessId: "business-2",
              businessName: "Harbor Foods",
              checklistPassRatePct: 100,
              completedAt: "2026-03-18T11:30:00.000Z",
              criticalFindings: 0,
              failedChecklistItems: 0,
              highFindings: 0,
              inspectionId: "inspection-2",
              officeCode: "SAN-01",
              officeId: "office-2",
              officeName: "Sanitation Office",
              permitNumber: "SAN-2026-002",
              reasons: [],
              scheduledAt: "2026-03-18T10:00:00.000Z",
              simulatedOutcome: "pass",
              totalChecklistItems: 1,
            },
          ],
          simulatedFailedCount: 0,
          simulatedPassCount: 1,
          topReasons: [],
        },
        error: null,
        isError: false,
        isLoading: false,
      },
    } as never);

    renderWithProviders(<InspectionTwinSimulator />);

    expect(
      screen.getByText("No inspections would fail under the simulated rule."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "No completed inspections in this window would newly fail under the simulated rule.",
      ),
    ).toBeInTheDocument();
  });
});
