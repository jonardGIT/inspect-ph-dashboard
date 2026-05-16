import { App as AntdApp, ConfigProvider } from "antd";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthSession } from "@/hooks/use-auth-session";
import { useInspectionBrowser } from "@/hooks/use-inspection-browser";
import { useInspectionLookups } from "@/hooks/use-inspection-lookups";

import OperationsReport from "./operations-report";

vi.mock("@/hooks/use-auth-session", () => ({
  useAuthSession: vi.fn(),
}));

vi.mock("@/hooks/use-inspection-browser", () => ({
  useInspectionBrowser: vi.fn(),
}));

vi.mock("@/hooks/use-inspection-lookups", () => ({
  useInspectionLookups: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/reports",
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () =>
    new URLSearchParams(
      "from=2026-05-01&lguId=lgu-1&officeId=office-1&status=overdue",
    ),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ConfigProvider>
      <AntdApp>{ui}</AntdApp>
    </ConfigProvider>,
  );
}

describe("OperationsReport", () => {
  beforeEach(() => {
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
          officeIds: ["office-1"],
          role: "admin",
          roleProfile: {
            accessScope: "global",
            label: "Platform Admin",
            permissions: ["inspection:read", "report:read"],
          },
        },
      },
    } as unknown as ReturnType<typeof useAuthSession>);
    vi.mocked(useInspectionBrowser).mockReturnValue({
      createInspectionMutation: {
        isPending: false,
        mutateAsync: vi.fn(),
      },
      inspectionsQuery: {
        data: {
          data: [
            {
              business: {
                businessName: "North Star Trading",
                id: "business-1",
              },
              createdAt: "2026-05-13T08:00:00.000Z",
              id: "inspection-1",
              office: {
                code: "BPLO-HQ",
                id: "office-1",
                lguId: "lgu-1",
                name: "BPLO Headquarters",
              },
              permit: {
                id: "permit-1",
                permitNumber: "BPLO-2026-001",
              },
              scheduledAt: "2026-05-14T08:00:00.000Z",
              status: "overdue",
              updatedAt: "2026-05-13T09:00:00.000Z",
            },
          ],
          meta: { limit: 10, page: 1, total: 1 },
        },
        error: null,
        isLoading: false,
      },
      summaryQuery: {
        data: {
          canceled: 0,
          completed: 9,
          inProgress: 3,
          overdue: 2,
          scheduled: 5,
          total: 19,
        },
        error: null,
        isLoading: false,
      },
      byOfficeQuery: {
        data: [],
        error: null,
        isLoading: false,
      },
      mapPointsQuery: {
        data: [
          {
            business: {
              businessName: "North Star Trading",
              id: "business-1",
            },
            id: "inspection-1",
            location: {
              accuracyMeters: 5,
              latitude: 17.6132,
              longitude: 121.7269,
            },
            office: {
              code: "BPLO-HQ",
              id: "office-1",
              lguId: "lgu-1",
              name: "BPLO Headquarters",
            },
            scheduledAt: "2026-05-14T08:00:00.000Z",
            status: "overdue",
          },
        ],
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useInspectionBrowser>);
    vi.mocked(useInspectionLookups).mockReturnValue({
      lgusQuery: {
        data: {
          data: [
            {
              city: "Tuguegarao City",
              code: "TUG-01",
              createdAt: "2026-05-13T08:00:00.000Z",
              id: "lgu-1",
              name: "Tuguegarao City LGU",
              province: "Cagayan",
              region: "Region II",
              updatedAt: "2026-05-13T08:00:00.000Z",
            },
          ],
          meta: { limit: 25, page: 1, total: 1 },
        },
        isLoading: false,
      },
      officesQuery: {
        data: {
          data: [
            {
              code: "BPLO-HQ",
              createdAt: "2026-05-13T08:00:00.000Z",
              id: "office-1",
              lguId: "lgu-1",
              name: "BPLO Headquarters",
              updatedAt: "2026-05-13T08:00:00.000Z",
            },
          ],
          meta: { limit: 25, page: 1, total: 1 },
        },
        isLoading: false,
      },
    } as unknown as ReturnType<typeof useInspectionLookups>);
  });

  it("renders the operations report summary and queue", () => {
    renderWithProviders(<OperationsReport />);

    expect(screen.getByText("Operations report")).toBeInTheDocument();
    expect(screen.getByText("Live inspection queue")).toBeInTheDocument();
    expect(screen.getAllByText("North Star Trading")).toHaveLength(2);
    expect(screen.getByText("Total inspections")).toBeInTheDocument();
    expect(screen.getByText("19")).toBeInTheDocument();
    expect(screen.getByText("Status: Overdue")).toBeInTheDocument();
    expect(
      screen.getByText("LGU: Tuguegarao City LGU · TUG-01"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Office: BPLO Headquarters · BPLO-HQ"),
    ).toBeInTheDocument();
    expect(screen.getByText("Inspection coverage map")).toBeInTheDocument();
    expect(screen.getByText("Open pin")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open inspection" }),
    ).toHaveAttribute("href", "/inspections/inspection-1");
  });
});
